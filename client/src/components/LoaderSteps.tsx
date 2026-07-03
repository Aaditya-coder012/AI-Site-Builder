import {
  CircleIcon,
  ScanLineIcon,
  SquareIcon,
  TriangleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { icon: ScanLineIcon, label: "Analyzing your request..." },
  { icon: SquareIcon, label: "Generating layout structure..." },
  { icon: TriangleIcon, label: "Assembling UI components..." },
  { icon: CircleIcon, label: "Finalizing your website..." },
];

const STEP_DURATION = 7000;
const LoaderSteps = () => {
  const [Current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((s) => (s + 1) % steps.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  const Icon = steps[Current].icon;
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-white">
      <div className="absolute inset-0 soft-grid opacity-[0.04]" />
      <div className="app-glow left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/25" />
      <div className="app-glow bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-500/20" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative flex size-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-indigo-400/30 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-white/10 bg-white/5 backdrop-blur" />
          <Icon className="size-8 text-white opacity-90 animate-bounce" />
        </div>

        <p
          key={Current}
          className="mt-8 text-lg font-medium tracking-wide text-white transition-all duration-500"
        >
          {steps[Current].label}
        </p>

        <p className="mt-2 text-xs text-slate-400 transition-opacity duration-500">
          This usually finishes in under a minute...
        </p>
      </div>
    </div>
  );
};

export default LoaderSteps;
