import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Message, Project, Version } from "../types";
import {
  BotIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/configs/axios";
import { toast } from "sonner";

const generationStages = [
  "Analyzing your request",
  "Enhancing the prompt",
  "Generating updated HTML",
  "Applying the changes",
  "Saving the new version",
] as const;

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  onProjectRefresh?: () => Promise<void> | void;
}

const Sidebar = ({
  isMenuOpen,
  project,
  isGenerating,
  setIsGenerating,
  onProjectRefresh,
}: SidebarProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [localConversation, setLocalConversation] = useState<Message[]>(
    project.conversation,
  );
  const [generationStage, setGenerationStage] = useState(0);

  useEffect(() => {
    setLocalConversation(project.conversation);
  }, [project.conversation]);

  const timeline = useMemo(
    () =>
      [...localConversation, ...project.versions].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [localConversation, project.versions],
  );

  const appendOptimisticMessages = (userText: string) => {
    const baseTime = new Date();
    const userMessage: Message = {
      id: `temp-user-${baseTime.getTime()}`,
      role: "user",
      content: userText,
      timestamp: baseTime.toISOString(),
    };
    const assistantMessage: Message = {
      id: `temp-assistant-${baseTime.getTime()}`,
      role: "assistant",
      content: "I'm on it. Updating your website now...",
      timestamp: new Date(baseTime.getTime() + 1).toISOString(),
    };

    setLocalConversation((current) => [...current, userMessage, assistantMessage]);
  };

  const handleRollback = async (versionId: string) => {
    try {
      setIsGenerating(true);
      await api.post(`/project/rollback/${project.id}/${versionId}`);
      toast.success("Rolled back to selected version");
      await onProjectRefresh?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitRevision = async (prompt: string) => {
    if (!prompt || isGenerating) return;

    try {
      appendOptimisticMessages(prompt);
      setInput("");
      setIsGenerating(true);
      setGenerationStage(0);
      await api.post(`/project/revision/${project.id}`, {
        message: prompt,
      });
      toast.success("Website updated successfully");
      await onProjectRefresh?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      await onProjectRefresh?.();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevisions = async (e: FormEvent) => {
    e.preventDefault();
    await submitRevision(input.trim());
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [timeline.length, isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      setGenerationStage(0);
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationStage((stage) =>
        stage < generationStages.length - 1 ? stage + 1 : stage,
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${isMenuOpen ? "max-sm:w-0 overflow-hidden" : "w-full"} `}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
          {timeline.map((message) => {
            const isMessage = "content" in message;

            if (isMessage) {
              const msg = message as Message;
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                      <BotIcon className="size-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${
                      isUser
                        ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none"
                        : "rounded-tl-none bg-gray-800 text-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <UserIcon className="size-5 text-gray-200" />
                    </div>
                  )}
                </div>
              );
            }

            const ver = message as Version;
            return (
              <div
                key={ver.id}
                className="w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2"
              >
                <div className="text-xs font-medium">
                  code updated <br />
                  <span className="text-gray-500 text-xs font-normal">
                    {new Date(ver.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {project.current_version_index === ver.id ? (
                    <button className="px-3 py-1 rounded-md text-xs bg-gray-700">
                      Current Version
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRollback(ver.id)}
                      className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Roll back to this version
                    </button>
                  )}
                  <Link
                    target="_blank"
                    to={`/preview/${project.id}/${ver.id}`}
                  >
                    <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded" />
                  </Link>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-start gap-3 justify-start rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <BotIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {generationStages[generationStage]}
                </p>
                <div className="mt-2 flex gap-1.5 h-full items-center">
                  <span
                    className="size-2 rounded-full animate-bounce bg-gray-500"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    className="size-2 rounded-full animate-bounce bg-gray-500"
                    style={{ animationDelay: "0.18s" }}
                  />
                  <span
                    className="size-2 rounded-full animate-bounce bg-gray-500"
                    style={{ animationDelay: "0.36s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messageRef} />
        </div>

        <form onSubmit={handleRevisions} className="m-3 relative">
          <div className="flex items-center gap-2">
            <textarea
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitRevision(input.trim());
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              value={input}
              rows={4}
              placeholder="Describe your website or request changes..."
              className="flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray text-gray-100 placeholder-gray-400 transition-all"
              disabled={isGenerating}
            />
            <button
              disabled={isGenerating || !input.trim()}
              className="absolute button-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-60"
            >
              {isGenerating ? (
                <Loader2Icon className="size-7 p-1.5 animate-spin text-white" />
              ) : (
                <SendIcon className="size-7 p-1.5 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
