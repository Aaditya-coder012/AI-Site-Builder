import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { toast } from "sonner";
import { dummyProjects } from "../assets/assets";

const Myprojects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const mergeProjects = (items: Project[]) => {
    const combined = [...dummyProjects, ...items];
    return combined.filter(
      (project, index, list) =>
        list.findIndex((item) => item.id === project.id) === index,
    );
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/user/projects");
      setProjects(mergeProjects(data.projects || []));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      setProjects(dummyProjects);
    } finally {
      setLoading(false);
    }
  };

  const deleteproject = async (projectId: string) => {
    const isSampleProject = dummyProjects.some(
      (project) => project.id === projectId,
    );

    try {
      if (!isSampleProject) {
        await api.post(`/project/${projectId}`);
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <div className="relative px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="app-glow left-0 top-10 h-64 w-64 rounded-full bg-indigo-500/15" />
        <div className="app-glow right-0 top-28 h-64 w-64 rounded-full bg-cyan-500/10" />
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="size-8 animate-spin text-indigo-200" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-10 min-h-[80vh]">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-2xl font-medium text-white">My Projects</h1>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-2 text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 active:scale-95 sm:px-6"
              >
                <PlusIcon size={18} />
                Create New
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {projects.map((project) => (
                <div
                  onClick={() => navigate(`/preview/${project.id}`)}
                  key={project.id}
                  className="group relative w-72 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8 max-sm:mx-auto"
                >
                  <div className="relative h-40 w-full overflow-hidden border-b border-white/5 bg-slate-950">
                    {project.current_code ? (
                      <iframe
                        srcDoc={project.current_code}
                        className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ transform: "scale(0.24)" }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        <p>No Preview</p>
                      </div>
                    )}
                  </div>
                  {/*content*/}
                  <div className="bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 text-white transition-colors group-hover:from-indigo-950/50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium line-clamp-2">
                        {project.name}
                      </h2>
                      <button className="ml-2 mt-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">
                        Website
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {project.initial_prompt}
                    </p>

                    <div onClick={(e) => e.stopPropagation()} className="mt-6 flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-3 text-white text-sm">
                        <button
                          onClick={() => navigate(`/preview/${project.id}`)}
                          className="rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/15"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/15"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TrashIcon
                      className="absolute right-3 top-3 size-8 scale-0 rounded-full bg-white p-1.5 text-red-500 transition-all duration-300 group-hover:scale-100"
                      onClick={() => deleteproject(project.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[80vh] flex-col items-center justify-center">
            <h1 className="text-3xl font-semibold text-gray-300">
              You have no projects yet!
            </h1>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-white transition hover:-translate-y-0.5 active:scale-95"
            >
              Create New
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Myprojects;
