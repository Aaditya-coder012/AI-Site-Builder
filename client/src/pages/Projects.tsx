import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import Sidebar from "../components/Sidebar";
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import ProjectPreview, {
  type ProjectPreviewRef,
} from "../components/ProjectPreview";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { dummyProjects } from "../assets/assets";
const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop",
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/user/project/${projectId}`);
      setProject(data.project);
      setIsGenerating(data.project.current_code ? false : true);
      setLoading(false);
    } catch (error: any) {
      const fallbackProject = dummyProjects.find(
        (project) => project.id === projectId,
      );

      if (fallbackProject) {
        setProject(fallbackProject as Project);
        setIsGenerating(false);
        setLoading(false);
        return;
      }

      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      setLoading(false);
    }
  };

  const saveProject = async () => {
    if (!projectId) return;
    const isSampleProject = dummyProjects.some(
      (project) => project.id === projectId,
    );
    if (isSampleProject) {
      toast("This is a sample project. Create a new project to save it.");
      return;
    }
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) return;

    try {
      setIsSaving(true);
      const { data } = await api.post(`/project/save/${projectId}`, {
        code,
      });
      setProject((prev) =>
        prev
          ? {
              ...prev,
              current_code: code,
              current_version_index: "",
            }
          : prev,
      );
      toast.success("Project saved successfully");
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const rebuildProject = async () => {
    if (!projectId || !project) return;
    const isSampleProject = dummyProjects.some(
      (sampleProject) => sampleProject.id === projectId,
    );
    if (isSampleProject) {
      toast("This is a sample project. Create a new project to rebuild it.");
      return;
    }

    try {
      setIsGenerating(true);
      const { data } = await api.post(`/project/rebuild/${projectId}`);
      toast.success(data.message || "Project rebuilt successfully");
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  };

  //download code (index.html)
  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) {
      if (isGenerating) {
        return;
      }
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  };

  const togglePublish = async () => {
    if (!projectId) return;
    const isSampleProject = dummyProjects.some(
      (project) => project.id === projectId,
    );
    if (isSampleProject) {
      toast("This is a sample project. Create a new project to publish it.");
      return;
    }

    try {
      const { data } = await api.get(`/user/publish-toggle/${projectId}`);
      setProject((prev) =>
        prev ? { ...prev, isPublished: data.project.isPublished } : prev,
      );
      toast.success(
        data.project.isPublished
          ? "Project published successfully"
          : "Project unpublished successfully",
      );
      if (data.project.isPublished) {
        navigate("/community");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProject();
    } else if (!isPending && !session?.user) {
      navigate("/");
      toast("Please login to view projects");
    }
  }, [session?.user]);
  useEffect(() => {
    if (project && !project.current_code) {
      const intervalId = setInterval(fetchProject, 1200);
      return () => clearInterval(intervalId);
    }
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <Loader2Icon className="size-8 animate-spin text-violet-200" />
      </div>
    );
  }

  return project ? (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-white">
      <div className="app-glow left-0 top-0 h-80 w-80 rounded-full bg-indigo-500/15" />
      <div className="app-glow right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10" />
      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-3 no-scrollbar glass-surface mx-3 mt-3 rounded-2xl">
        {/* left */}
        <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
          <img
            src="/favicon.svg"
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="max-w-64 sm:max-w-xs">
            <p className="text-sm text-medium capitalize truncate">
              {project.name}
            </p>
            <p className="text-xs text-slate-400 -mt-0.5">
              Previewing last saved version
            </p>
          </div>

          <div className="sm:hidden flex-1 flex justify-end">
            {isMenuOpen ? (
              <MessageSquareIcon
                onClick={() => setIsMenuOpen(false)}
                className="size-6 cursor-pointer"
              />
            ) : (
              <XIcon
                onClick={() => setIsMenuOpen(true)}
                className="size-6 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* middle */}
        <div className="hidden sm:flex gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
          <SmartphoneIcon
            onClick={() => setDevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "phone" ? "bg-white/15" : ""
            }`}
          />

          <TabletIcon
            onClick={() => setDevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "tablet" ? "bg-white/15" : ""
            }`}
          />

          <LaptopIcon
            onClick={() => setDevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "desktop" ? "bg-white/15" : ""
            }`}
          />
        </div>

        {/* right */}
        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          {!project.current_code && !isGenerating && (
            <button
              onClick={rebuildProject}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-white transition hover:-translate-y-0.5"
            >
              Rebuild
            </button>
          )}
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="max-sm:hidden flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>

          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
          >
            <FullscreenIcon size={16} /> Preview
          </Link>

          <button
            onClick={downloadCode}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-white transition hover:-translate-y-0.5"
          >
            <ArrowBigDownDashIcon size={16} /> Download
          </button>

          <button
            onClick={togglePublish}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white transition hover:-translate-y-0.5"
          >
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}
            {project.isPublished ? " unpublish" : " publish"}
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-auto p-3 pt-0">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          onProjectRefresh={fetchProject}
        />
        <div className="relative flex-1 pl-0">
          <ProjectPreview
            ref={previewRef}
            project={project}
            isGenerating={isGenerating}
            device={device}
          />
          {!project.current_code && !isGenerating && (
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <div className="pointer-events-auto glass-surface max-w-md rounded-3xl p-5 text-sm text-slate-200 shadow-2xl shadow-black/30">
                <p className="text-base font-medium text-white">
                  This project is not complete yet.
                </p>
                <p className="mt-2 text-slate-300">
                  Use Rebuild to regenerate it from the original prompt and get
                  back into editing immediately.
                </p>
                <button
                  onClick={rebuildProject}
                  className="mt-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5"
                >
                  Rebuild project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load project!
      </p>
    </div>
  );
};

export default Projects;
