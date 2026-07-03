import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Home = () => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!session?.user) {
        return toast.error("Please Sign in to create a project");
      } else if (!input.trim()) {
        return toast.error("Please enter a message");
      }
      setLoading(true);
      const { data } = await api.post("/user/project", {
        initial_prompt: input,
      });
      setLoading(false);
      navigate(`/projects/${data.projectId}`);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-10 text-sm text-white md:px-8 lg:px-16">
      <div className="app-glow left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30" />
      <div className="app-glow right-8 top-24 h-64 w-64 rounded-full bg-cyan-500/20" />
      <div className="soft-grid absolute inset-0 opacity-[0.06]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center">
        <div className="glass-surface float-slow mt-12 flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-200">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          AI site builder
        </div>

        <div className="mt-10 max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Start creating websites instantly
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-6xl md:leading-[1.05]">
            Turn thoughts into websites with an AI workspace that keeps up with
            the conversation.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Create, refine, publish, and keep iterating on your site in one
            flow. The builder remembers your changes, renders live previews,
            and updates the design as you keep talking to it.
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <form
            onSubmit={onSubmitHandler}
            className="glass-surface group rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Generate a new project</p>
                <h2 className="text-xl font-medium text-white">
                  Describe your idea
                </h2>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Prompt to site
              </div>
            </div>

            <textarea
              onChange={(e) => setInput(e.target.value)}
              className="min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              rows={5}
              placeholder="Example: Build a bold SaaS landing page for an AI scheduling tool with a glowing hero, pricing cards, testimonials, and a modern footer."
              required
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Tip: mention style, sections, and the feeling you want.
              </p>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 active:scale-95">
                {!loading ? (
                  "Create with AI"
                ) : (
                  <>
                    Creating <Loader2Icon className="size-4 animate-spin text-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="glass-surface rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Built for iteration</p>
                <h3 className="text-xl font-medium text-white">
                  Live editing loop
                </h3>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                Always in sync
              </div>
            </div>

            <div className="space-y-3">
              {[
                "1. Start from a natural-language prompt",
                "2. Refine the site through chat revisions",
                "3. Preview, save, roll back, and publish",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4 transition duration-300 hover:border-white/15 hover:bg-white/8"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold text-white">
                    0{index + 1}
                  </span>
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400">
          {["Framer", "Huawei", "Instagram", "Microsoft", "Walmart"].map(
            (brand) => (
              <div key={brand} className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                {brand}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
