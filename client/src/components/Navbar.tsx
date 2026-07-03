import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { UserButton } from "@daveyplate/better-auth-ui";
export const Navbar = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const { data: session, isPending } = authClient.useSession();
  return (
    <header className="relative z-50">
      <nav className="glass-surface mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-3 md:mx-6 lg:mx-10 xl:mx-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={assets.logo} alt="Logo" className="h-6 sm:h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-200">
          <Link className="transition hover:text-white" to="/">
            Home
          </Link>
          <Link className="transition hover:text-white" to="/projects">
            My Projects
          </Link>
          <Link className="transition hover:text-white" to="/community">
            Community
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
          ) : !session?.user ? (
            <button
              onClick={() => navigate("/auth/signin")}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-indigo-500/30 active:scale-95"
            >
              Get started
            </button>
          ) : (
            <UserButton size="icon" />
          )}
          <button
            id="open-menu"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 active:scale-95 md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16" />
              <path d="M4 12h16" />
              <path d="M4 19h16" />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 text-white backdrop-blur-md md:hidden">
          <div className="glass-surface w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Navigate
              </span>
              <button
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 text-lg">
              <Link className="rounded-2xl bg-white/5 py-3 transition hover:bg-white/10" to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link className="rounded-2xl bg-white/5 py-3 transition hover:bg-white/10" to="/projects" onClick={() => setMenuOpen(false)}>
                My Projects
              </Link>
              <Link className="rounded-2xl bg-white/5 py-3 transition hover:bg-white/10" to="/community" onClick={() => setMenuOpen(false)}>
                Community
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
