import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface EditorPanelProps {
  selectedElement: {
    tagName: string;
    className: string;
    text: string;
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
  const [Values, setValues] = useState(selectedElement);

  useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);

  if (!selectedElement || !Values) return null;

  const handleChange = (field: string, value: string) => {
    const newValues = { ...Values, [field]: value };
    if (field in Values.styles) {
      newValues.styles = { ...Values.styles, [field]: value };
    }
    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...Values.styles, [styleName]: value };
    setValues({ ...Values, styles: newStyles });
    onUpdate({ styles: { [styleName]: value } });
  };

  return (
    <div
      className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl 
    border border-gray-200 p-4 z-50 animate-fade-in fade-in"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Edit Element</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="text-black">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Text Content
          </label>
          <textarea
            value={Values.text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Class Name
          </label>
          <input
            type="text"
            value={Values.className || ""}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full text-sm text-black p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Padding
            </label>
            <input
              type="text"
              value={Values.styles.padding}
              onChange={(e) => handleStyleChange("padding", e.target.value)}
              className="w-full text-sm text-black p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Margin
            </label>
            <input
              type="text"
              value={Values.styles.margin}
              onChange={(e) => handleStyleChange("margin", e.target.value)}
              className="w-full text-sm text-black p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Font Size
          </label>
          <input
            type="text"
            value={Values.styles.fontSize}
            onChange={(e) => handleStyleChange("fontSize", e.target.value)}
            className="w-full text-sm text-black p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Background
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-md p-1">
              <input
                type="color"
                value={
                  Values.styles.backgroundColor === "rgba(0,0,0,0)"
                    ? "#ffffff"
                    : Values.styles.backgroundColor
                }
                onChange={(e) =>
                  handleStyleChange("backgroundColor", e.target.value)
                }
                className="w-6 h-6 cursor-pointer"
              />
              <span className="text-xs text-gray-600 truncate">
                {Values.styles.backgroundColor}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-md p-1">
              <input
                type="color"
                value={Values.styles.color}
                onChange={(e) => handleStyleChange("color", e.target.value)}
                className="w-6 h-6 cursor-pointer"
              />
              <span className="text-xs text-gray-600 truncate">
                {Values.styles.color}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
