import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { toast } from "sonner";
import { dummyProjects } from "../assets/assets";

const Community = () => {
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
      const { data } = await api.post("/project/published");
      setProjects(mergeProjects(data.projects || []));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      setProjects(dummyProjects);
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-medium text-white">
                Published Projects
              </h1>
            </div>

            <div className="flex flex-wrap items-start gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/view/${project.id}`}
                  target="_blank"
                  className="group h-fit w-72 self-start overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8 max-sm:mx-auto"
                >
                  {/*Desktop like mini preview*/}
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

                    <div className="flex justify-between items-center mt-6">
                      <span className="text-gray-500 text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-3 text-white text-sm">
                        <button className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/15">
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-slate-800 font-semibold text-black">
                            {project.user?.name?.slice(0, 1)}
                          </span>
                          {project.user?.name}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh] ">
            <h1 className="text-3xl font-semibold text-gray-300">
              you have no projects yet!
            </h1>
            <button
              onClick={() => navigate("/")}
              className="mt-5 text-white px-5 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
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

export default Community;
