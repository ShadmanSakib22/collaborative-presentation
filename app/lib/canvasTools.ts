import {
  Canvas,
  Rect,
  Circle,
  Triangle,
  FabricImage,
  Textbox,
  PencilBrush,
} from "fabric";

export const createRectangle = (canvas: Canvas) => {
  const rect = new Rect({
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2 - 50,
    fill: "rgba(0,0,0,0.1)",
    width: 100,
    height: 100,
    stroke: "#000",
    strokeWidth: 2,
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
  return rect;
};

export const createCircle = (canvas: Canvas) => {
  const circle = new Circle({
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2 - 50,
    fill: "rgba(0,0,0,0.1)",
    radius: 50,
    stroke: "#000",
    strokeWidth: 2,
  });
  canvas.add(circle);
  canvas.setActiveObject(circle);
  return circle;
};

export const createTriangle = (canvas: Canvas) => {
  const triangle = new Triangle({
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2 - 50,
    fill: "rgba(0,0,0,0.1)",
    width: 100,
    height: 100,
    stroke: "#000",
    strokeWidth: 2,
  });
  canvas.add(triangle);
  canvas.setActiveObject(triangle);
  return triangle;
};

export const createText = (canvas: Canvas) => {
  const text = new Textbox("Click to edit text", {
    left: canvas.width! / 2,
    top: canvas.height! / 2,
    originX: "center",
    originY: "center",
    fontSize: 20,
    fill: "#000000",
    width: 200,
    textAlign: "center",
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  return text;
};

export const enableSelect = (canvas: Canvas) => {
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.forEachObject((obj) => {
    obj.selectable = true;
  });
};

export const enableDrawing = (canvas: Canvas) => {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new PencilBrush(canvas);
  canvas.freeDrawingBrush.width = 5;
  canvas.freeDrawingBrush.color = "#000";
};

export const handleImageUpload = (canvas: Canvas, file: any) => {
  if (!file) {
    console.log("No file received");
    return;
  }

  console.log("File received:", file);

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result as string;

    img.onload = () => {
      const fabricImage = new FabricImage(img, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: "center",
        originY: "center",
        scaleX: 0.5,
        scaleY: 0.5,
      });
      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      canvas.requestRenderAll();
    };
  };
  reader.readAsDataURL(file);
};

export const deleteSelectedObjects = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
  }
};
