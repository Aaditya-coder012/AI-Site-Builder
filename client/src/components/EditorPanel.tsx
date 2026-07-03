import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface EditorPanelProps {
  selectedElement: {
    tagName: string;
    className: string;
    text: string;
    src?: string;
    href?: string;
    alt?: string;
    styles: {
      padding: string;
      margin: string;
      backgroundColor: string;
      color: string;
      fontSize: string;
    };
  } | null;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const EditorPanel = ({
  selectedElement,
  onUpdate,
  onClose,
}: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);

  if (!selectedElement || !values) return null;

  const handleChange = (field: string, value: string) => {
    const newValues = { ...values, [field]: value };
    if (field in values.styles) {
      newValues.styles = { ...values.styles, [field]: value };
    }
    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.styles, [styleName]: value };
    setValues({ ...values, styles: newStyles });
    onUpdate({ styles: { [styleName]: value } });
  };

  const handleAssetChange = (field: "src" | "href" | "alt", value: string) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        handleAssetChange("src", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isImage = values.tagName === "IMG";
  const isLinkable =
    values.tagName === "A" || values.tagName === "BUTTON" || values.tagName === "SPAN";

  return (
    <div className="absolute right-4 top-4 z-50 w-80 rounded-3xl border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl animate-fade-in fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Edit Element</h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition hover:bg-white/10"
        >
          <X className="h-4 w-4 text-slate-300" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Text Content
          </label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        {isImage && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Image URL
              </label>
              <input
                type="text"
                value={values.src || ""}
                onChange={(e) => handleAssetChange("src", e.target.value)}
                placeholder="Paste an image URL"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Upload Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-cyan-500 file:px-3 file:py-2 file:text-white hover:file:opacity-90"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Alt Text
              </label>
              <input
                type="text"
                value={values.alt || ""}
                onChange={(e) => handleAssetChange("alt", e.target.value)}
                placeholder="Describe the image"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
        )}

        {isLinkable && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Link URL
            </label>
            <input
              type="text"
              value={values.href || ""}
              onChange={(e) => handleAssetChange("href", e.target.value)}
              placeholder="Paste GitHub or live demo link"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Class Name
          </label>
          <input
            type="text"
            value={values.className || ""}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Padding
            </label>
            <input
              type="text"
              value={values.styles.padding}
              onChange={(e) => handleStyleChange("padding", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Margin
            </label>
            <input
              type="text"
              value={values.styles.margin}
              onChange={(e) => handleStyleChange("margin", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Font Size
          </label>
          <input
            type="text"
            value={values.styles.fontSize}
            onChange={(e) => handleStyleChange("fontSize", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Background
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <input
                type="color"
                value={
                  values.styles.backgroundColor === "rgba(0,0,0,0)"
                    ? "#ffffff"
                    : values.styles.backgroundColor
                }
                onChange={(e) =>
                  handleStyleChange("backgroundColor", e.target.value)
                }
                className="h-7 w-7 cursor-pointer rounded-full border border-white/10 bg-transparent"
              />
              <span className="truncate text-xs text-slate-300">
                {values.styles.backgroundColor}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Text Color
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <input
                type="color"
                value={values.styles.color}
                onChange={(e) => handleStyleChange("color", e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border border-white/10 bg-transparent"
              />
              <span className="truncate text-xs text-slate-300">
                {values.styles.color}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
