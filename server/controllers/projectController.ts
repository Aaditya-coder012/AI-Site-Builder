import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { generateContentWithFallback } from "../lib/gemini.js";

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const sanitizeCode = (code: string) =>
  code
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```$/g, "")
    .trim();

const enhanceProjectPrompt = async (message: string) => {
  const promptEnhanceResponse = await generateContentWithFallback([
    {
      role: "user",
      parts: [
        {
          text: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

Enhance this by:
1. Being specific about what elements to change
2. Mentioning design details (colors, spacing, sizes)
3. Clarifying the desired outcome
4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).

User's request: "${message}"`,
        },
      ],
    },
  ]);

  return promptEnhanceResponse.text || message;
};

const generateProjectCode = async (currentCode: string, enhancedPrompt: string) => {
  const codeGenerationResponse = await generateContentWithFallback([
    {
      role: "user",
      parts: [
        {
          text: `You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- Use Tailwind CSS for ALL styling (NO custom CSS).
- Use Tailwind utility classes for all styling changes.
- Include all JavaScript in <script> tags before closing </body>
- Make sure it's a complete, standalone HTML document with Tailwind CSS
- Return the HTML code only, nothing else

Apply the requested changes while maintaining the Tailwind CSS styling approach.

Current website code:
${currentCode}

Requested change:
${enhancedPrompt}`,
        },
      ],
    },
  ]);

  return sanitizeCode(codeGenerationResponse.text || "");
};

// controller Function to Make Revision
export const makeRevision = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const projectId = getParamValue(req.params.projectId);
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Please enter a valid prompt" });
    }

    const currentProject = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!currentProject) {
      return res.status(404).json({ message: "project not found" });
    }

    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId,
      },
    });

    //Enhance user prompt
    const enhancedPrompt = await enhanceProjectPrompt(message);

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Now making changes to your website...",
        projectId,
      },
    });

    //Generate website code
    const code = await generateProjectCode(
      currentProject.current_code || "",
      enhancedPrompt,
    );

    const version = await prisma.version.create({
      data: {
        code,
        description: "changes made",
        projectId,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've made the changes to your website ! You can now preview it",
        projectId,
      },
    });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code,
        current_version_index: version.id,
      },
    });

    res.json({ message: "Changes made successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

export const rebuildProject = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const projectId = getParamValue(req.params.projectId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentProject = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!currentProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const basePrompt = currentProject.initial_prompt?.trim();
    if (!basePrompt) {
      return res.status(400).json({ message: "Project prompt is missing" });
    }

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Rebuilding your website from the original prompt...",
        projectId,
      },
    });

    const enhancedPrompt = await enhanceProjectPrompt(basePrompt);
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId,
      },
    });

    const code = await generateProjectCode(
      currentProject.current_code || "",
      enhancedPrompt,
    );

    const version = await prisma.version.create({
      data: {
        code,
        description: "rebuild",
        projectId,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've rebuilt your website! You can now preview it and continue editing.",
        projectId,
      },
    });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code,
        current_version_index: version.id,
      },
    });

    res.json({ message: "Project rebuilt successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

// Controller Function to rollback to a specific version |
export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const projectId = getParamValue(req.params.projectId);
    const versionId = getParamValue(req.params.versionId);

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const version = project.versions.find(
      (version) => version.id === versionId,
    );
    if (!version) {
      return res.status(404).json({ message: "version not found" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've rolled back your website to selected version. You can now preview it",
        projectId,
      },
    });

    res.json({ message: "Version rolled back" });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

//Controller Function to Delete a Project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const projectId = getParamValue(req.params.projectId);

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.websiteProject.delete({
      where: { id: projectId },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

//Controller for getting project code for preview
export const getProjectPreview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const projectId = getParamValue(req.params.projectId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

//Get published Projects
export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: { user: true },
    });

    res.json({ projects });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

//Get single project by id
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = getParamValue(req.params.projectId);
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId },
    });

    if (!project || project.isPublished === false || !project?.current_code) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ code: project.current_code });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};

//Controller to save project code
export const saveProjectCode = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const projectId = getParamValue(req.params.projectId);
    const { code } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { current_code: code, current_version_index: "" },
    });

    res.json({ code: project.current_code });
  } catch (error: any) {
    console.log(error.code || error.message);
    res.status(500).json({ message: error.message });
  }
};
