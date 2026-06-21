import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";

const Home = () => {
  const [, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">
      <a
        href="https://prebuiltui.com"
        className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-3 text-sm mt-20"
      >
        <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">
          NEW
        </span>
        <p className="flex items-center gap-2">
          <span>Try 30 days free trial option</span>
          <svg
            className="mt-px"
            width="6"
            height="9"
            viewBox="0 0 6 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m1 1 4 3.5L1 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </a>

      <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
        Turn thoughts into websites instantly, with AI.
      </h1>

      <p className="text-center text-base max-w-md mt-2">
        Create, customize and publish websites faster than ever with our AI Site
        Builder.
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all"
      >
        <textarea
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent outline-none text-gray-300 resize-none w-full"
          rows={4}
          placeholder="Describe your presentation in details"
          required
        />
        <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2">
          {!loading ? (
            "Create with AI"
          ) : (
            <>
              Creating{" "}
              <Loader2Icon className="animate-spin size-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Brand Section */}
      <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 mx-auto mt-16 text-[#A0A0B0]">
        {/* Framer */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L3 12h9v12l9-12h-9V0z" />
          </svg>
          <span className="text-xl font-semibold text-white">Framer</span>
        </div>

        {/* HUAWEI */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1.63L3.89 22.37h2.24l1.5-4.04h6.74l1.5 4.04h2.24L12 1.63zm-2.02 14.28L12 5.37l2.02 10.54h-4.04z" />
          </svg>
          <span className="text-xl font-semibold text-white">HUAWEI</span>
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.803.245 2.226.41.56.218.96.478 1.383.9.423.423.683.823.9 1.383.165.423.356 1.056.41 2.226.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.245 1.803-.41 2.226-.218.56-.478.96-.9 1.383-.423.423-.823.683-1.383.9-.423.165-1.056.356-2.226.41-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.803-.245-2.226-.41-.56-.218-.96-.478-1.383-.9-.423-.423-.683-.823-.9-1.383-.165-.423-.356-1.056-.41-2.226-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.245-1.803.41-2.226.218-.56.478-.96.9-1.383.423-.423.823-.683 1.383-.9.423-.165 1.056-.356 2.226-.41 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.277.058-2.15.258-2.915.556-.787.305-1.455.714-2.122 1.382-.667.667-1.076 1.335-1.382 2.122-.298.765-.498 1.638-.556 2.915-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.277.258 2.15.556 2.915.305.787.714 1.455 1.382 2.122.667.667 1.335 1.076 2.122 1.382.765.298 1.638.498 2.915.556 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.058 2.15-.258 2.915-.556.787-.305 1.455-.714 2.122-1.382.667-.667 1.076-1.335 1.382-2.122.298-.765.498-1.638.556-2.915.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.277-.258-2.15-.556-2.915-.305-.787-.714-1.455-1.382-2.122-.667-.667-1.335-1.076-2.122-1.382-.765-.298-1.638-.498-2.915-.556C15.667.014 15.259 0 12 0z" />
            <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
          </svg>
          <span className="text-xl font-semibold text-white">Instagram</span>
        </div>

        {/* Microsoft */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 11.4h10.4V1H1v10.4zm11.6 0H23V1H12.6v10.4zM1 23h10.4V12.6H1V23zm11.6 0H23V12.6H12.6V23z" />
          </svg>
          <span className="text-xl font-semibold text-white">Microsoft</span>
        </div>

        {/* Walmart */}
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.25 10.25h-3.5v-3.5l-1.5 1.5-1.5-1.5v3.5h-3.5l1.5 1.5-1.5 1.5h3.5v3.5l1.5-1.5 1.5 1.5v-3.5h3.5l-1.5-1.5zM24 10.25h-3.5v3.5h3.5zm0-2h-3.5v-3.5h3.5zm-15.5 0h-3.5v-3.5h3.5zm0 5.5h-3.5v3.5h3.5z" />
          </svg>
          <span className="text-xl font-semibold text-white">Walmart</span>
        </div>
      </div>
    </section>
  );
};

export default Home;
