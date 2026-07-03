import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { generateContentWithFallback } from "../lib/gemini.js";

export const getUserProject = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId } = req.params;
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId as string, userId },
      include: { conversation: true, versions: true, user: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      include: { versions: true, conversation: true },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ projects });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId } = req.params;
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId as string, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = await prisma.websiteProject.update({
      where: { id: project.id },
      data: { isPublished: !project.isPublished },
    });

    res.json({ project: updatedProject });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createUserProject = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const { initial_prompt } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!initial_prompt || typeof initial_prompt !== "string") {
      return res.status(400).json({ message: "Initial prompt is required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const project = await prisma.websiteProject.create({
      data: {
        name:
          initial_prompt.length > 50
            ? initial_prompt.substring(0, 47) + "..."
            : initial_prompt,
        initial_prompt,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalCreation: { increment: 1 } },
    });

    await prisma.conversation.create({
      data: {
        role: "user",
        content: initial_prompt,
        projectId: project.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Now generating your website...",
        projectId: project.id,
      },
    });

    const version = await prisma.version.create({
      data: {
        code: "",
        description: "Initial version",
        projectId: project.id,
      },
    });

    // 3. Call the modern .models endpoint layout
    const promptEnhanceResponse = await generateContentWithFallback([
      {
        role: "user",
        parts: [
          {
            text: `You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

            Enhance this prompt by:
            1. Adding specific design details (layout, color scheme, typography)
            2. Specifying key sections and features
            3. Describing the user experience and interactions
            4. Including modern web design best practices
            5. Mentioning responsive design requirements
            6. Adding any missing but important elements

Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).
            
            User original prompt: "${initial_prompt}"`,
          },
        ],
      },
    ]);

    // 4. Property execution (.text) works flawlessly on this SDK version
    const enhancedPrompt = promptEnhanceResponse.text || initial_prompt;

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId: project.id,
      },
    });

    // 5. Codebase Generation using the uniform format
    const codeGenerationResponse = await generateContentWithFallback([
      {
        role: "user",
        parts: [
          {
            text: `You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

            CRITICAL REQUIREMENTS:
            - You MUST output valid HTML ONLY. 
            - Use Tailwind CSS for ALL styling
            - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            - Use Tailwind utility classes extensively for styling, animations, and responsiveness
            - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
            - Use modern, beautiful design with great UX using Tailwind classes
            - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
            - Use Tailwind animations and transitions (animate-*, transition-*)
            - Include all necessary meta tags
            - Use Google Fonts CDN if needed for custom fonts
            - Use placeholder images from https://placehold.co/600x400
            - Use Tailwind gradient classes for beautiful backgrounds
            - Make sure all buttons, cards, and components use Tailwind styling

            CRITICAL HARD RULES:
            1. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
            2. Do NOT include markdown, explanations, notes, or code fences.

The HTML should be complete and ready to render as-is with Tailwind CSS.`,
          },
        ],
      },
    ]);

    const code = codeGenerationResponse.text || "";

    const cleanCode = code
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```$/g, "")
      .trim();

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've created your website! You can now preview it and request any changes.",
        projectId: project.id,
      },
    });

    await prisma.websiteProject.update({
      where: { id: project.id },
      data: {
        current_code: cleanCode,
        current_version_index: version.id,
      },
    });

    await prisma.version.update({
      where: { id: version.id },
      data: {
        code: cleanCode,
      },
    });

    res.json({ projectId: project.id });
  } catch (error: any) {
    console.error(error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          message: error.message || "An unexpected generation error occurred.",
        });
    }
  }
};
