"use client";
import { Canvas, Gradient } from "fabric";
import { useState } from "react";

interface StyleToolbarProps {
  canvas: Canvas | null;
  userRole: string;
}

export default function StyleToolbar({ canvas, userRole }: StyleToolbarProps) {
  const isDisabled = userRole === "viewer";
  const [strokeWidth, setStrokeWidth] = useState(1);
  const fonts = ["Comic Sans MS", "Times New Roman", "Impact"];
  const fontWeights = [400, 600, 700];
  const [customColor, setCustomColor] = useState("#000000");
  const [customGradient, setCustomGradient] = useState({
    start: "#000000",
    end: "#ffffff",
  });

  const presetColors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
  const presetGradients = [
    { start: "#ff0000", end: "#00ff00" },
    { start: "#0000ff", end: "#ff0000" },
    { start: "#000000", end: "#ffffff" },
  ];

  const handleStrokeWidth = (width: number) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.set("strokeWidth", width);
    setStrokeWidth(width);
    canvas.requestRenderAll();
  };

  const handleStrokeColor = (color: string) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    activeObject.set("stroke", color);
    canvas.requestRenderAll();
  };

  const handleBackgroundColor = (color: string) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    activeObject.set("fill", color);
    canvas.requestRenderAll();
  };

  const handleGradient = (startColor: string, endColor: string) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const gradient = new Gradient({
      type: "linear",
      coords: {
        x1: 0,
        y1: 0,
        x2: activeObject.width,
        y2: activeObject.height,
      },
      colorStops: [
        { offset: 0, color: startColor },
        { offset: 1, color: endColor },
      ],
    });

    activeObject.set("fill", gradient);
    canvas.requestRenderAll();
  };

  const handleFontChange = (font: string) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "textbox") return;

    activeObject.set("fontFamily", font);
    canvas.requestRenderAll();
  };

  const handleFontWeight = (weight: string) => {
    if (!canvas || isDisabled) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "textbox") return;

    activeObject.set("fontWeight", weight);
    canvas.requestRenderAll();
  };

  return (
    <div className="flex gap-4 flex-col">
      {/* Stroke Color */}
      <div className="flex items-center space-x-2">
        <label>Stroke:</label>
        <select
          onChange={(e) => handleStrokeColor(e.target.value)}
          className="select select-bordered select-sm w-[120px]"
        >
          {presetColors.map((color) => (
            <option
              key={color}
              value={color}
              style={{ backgroundColor: color }}
            >
              {color}
            </option>
          ))}
        </select>
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            handleStrokeColor(e.target.value);
          }}
          className="w-8 h-8"
        />
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <label className="text-nowrap">Stroke Width:</label>
        <select
          value={strokeWidth}
          onChange={(e) => handleStrokeWidth(Number(e.target.value))}
          className="select select-bordered select-sm w-[120px]"
        >
          {[0, 1, 2, 3, 4, 5, 10].map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      </div>

      {/*Font Family*/}
      <select
        onChange={(e) => handleFontChange(e.target.value)}
        disabled={isDisabled}
        className="select select-bordered select-sm "
      >
        <option value="">Font Family</option>
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => handleFontWeight(e.target.value)}
        disabled={isDisabled}
        className="select select-bordered select-sm"
      >
        <option value="">Font Weight</option>
        {fontWeights.map((weight) => (
          <option key={weight} value={weight}>
            {weight}
          </option>
        ))}
      </select>

      {/* Fill Color */}
      <div className="flex items-center space-x-2">
        <label>Fill:</label>
        <select
          onChange={(e) => handleBackgroundColor(e.target.value)}
          className="select select-bordered select-sm w-[120px]"
        >
          {presetColors.map((color) => (
            <option
              key={color}
              value={color}
              style={{ backgroundColor: color }}
            >
              {color}
            </option>
          ))}
        </select>
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            handleBackgroundColor(e.target.value);
          }}
          className="w-8 h-8"
        />
      </div>

      {/* Gradient */}
      <div className="flex items-center space-x-2">
        <label>Gradient:</label>
        <select
          onChange={(e) => {
            const [start, end] = e.target.value.split(",");
            handleGradient(start, end);
          }}
          className="select select-bordered select-sm w-[120px]"
        >
          {presetGradients.map((gradient, index) => (
            <option
              key={index}
              value={`${gradient.start},${gradient.end}`}
              style={{
                background: `linear-gradient(to right, ${gradient.start}, ${gradient.end})`,
              }}
            >
              Gradient {index + 1}
            </option>
          ))}
        </select>
        <div className="flex space-x-1">
          <input
            type="color"
            value={customGradient.start}
            onChange={(e) => {
              setCustomGradient({ ...customGradient, start: e.target.value });
              handleGradient(e.target.value, customGradient.end);
            }}
            className="w-8 h-8"
          />
          <input
            type="color"
            value={customGradient.end}
            onChange={(e) => {
              setCustomGradient({ ...customGradient, end: e.target.value });
              handleGradient(customGradient.start, e.target.value);
            }}
            className="w-8 h-8"
          />
        </div>
      </div>
    </div>
  );
}
