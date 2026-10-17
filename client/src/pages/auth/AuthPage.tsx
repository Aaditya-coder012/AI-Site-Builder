import { useParams } from "react-router-dom";
import { AuthView } from "@daveyplate/better-auth-ui";
import { toast } from "sonner";
import api from "@/configs/axios";

export default function AuthPage() {
  const { pathname } = useParams();

  const handleDemoLogin = async () => {
    try {
      await api.post("/auth/demo-login");
      toast.success("Signed in as Demo Creator!");
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Demo login failed");
    }
  };

  return (
    <main className="p-6 flex flex-col justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-sm mb-4">
        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer text-center"
        >
          🚀 Instant Demo Login (1-Click)
        </button>
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-black px-3 text-xs text-slate-400">or continue with email</span>
        </div>
      </div>
      <AuthView
        pathname={pathname}
        classNames={{ base: "bg-black/10 ring ring-indigo-900" }}
      />
    </main>
  );
}
