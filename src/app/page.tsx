"use client";
import React, { useEffect, useRef } from "react";
import * as joint from "@joint/core";
import {
  SquareIcon,
  CircleIcon,
  DiamondIcon,
  TriangleIcon,
} from "lucide-react";
import DaigramBuilder from "@/components/daigram-builder";
import DaigramBuilder2 from "@/components/daigram-builder3";

export default function Home() {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);
  const paperInstanceRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = React.useState<any>(null);

  // Color scheme for classy design
  const colors = {
    rectangle: {
      fill: "#2563eb",
      stroke: "#1e40af",
      shadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    },
    circle: {
      fill: "#059669",
      stroke: "#065f46",
      shadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
    },
    diamond: {
      fill: "#dc2626",
      stroke: "#7f1d1d",
      shadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
    },
    triangle: {
      fill: "#9333ea",
      stroke: "#581c87",
      shadow: "0 4px 12px rgba(147, 51, 234, 0.3)",
    },
  };

  const openLabelEditor = (
    view: joint.dia.ElementView | joint.dia.LinkView,
    paper: joint.dia.Paper
  ) => {
    const model = view.model;

    const text = model.isLink()
      ? model.label(0)?.attrs?.text?.text || ""
      : model.attr("label/text") || "";

    const labelEl = view.el.querySelector(
      ".joint-label"
    ) as SVGTextElement | null;

    if (!labelEl) return;

    const bbox = labelEl.getBBox();
    const paperRect = paper.el.getBoundingClientRect();

    setEditing({
      view,
      value: text,
      x: paperRect.left + bbox.x,
      y: paperRect.top + bbox.y,
      width: Math.max(bbox.width + 20, 60),
      height: Math.max(bbox.height + 10, 24),
    });

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };
  const saveLabel = () => {
    if (!editing) return;

    const model = editing.view?.model;

    if (!model) return;

    if (model.isLink()) {
      if (model.labels().length === 0) {
        model.appendLabel({
          attrs: {
            text: {
              text: editing.value,
              fill: "#374151",
              fontSize: 12,
              fontWeight: "bold",
            },
          },
          position: 0.5,
        });
      } else {
        model.label(0, {
          attrs: {
            text: {
              text: editing.value,
              fill: "#374151",
              fontSize: 12,
              fontWeight: "bold",
            },
          },
        });
      }
    } else {
      model.attr("label/text", editing.value);
    }

    setEditing(null);
  };

  const cancelLabel = () => setEditing(null);

  // Initialize Paper & Graph
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;

    const graph = new joint.dia.Graph();
    graphRef.current = graph;

    const paper = new joint.dia.Paper({
      el,
      model: graph,
      width: el.clientWidth,
      height: el.clientHeight,
      interactive: (cellView, eventName) => {
        if (cellView.model.isLink()) return true;
        const target = (eventName as any)?.target as HTMLElement;
        const isPort = target?.closest("[magnet]") != null;
        if (isPort) return { elementMove: false, addLinkFromMagnet: true };
        return { elementMove: true };
      },
      defaultLink: () =>
        new joint.shapes.standard.Link({
          attrs: {
            line: { stroke: "#6b7280", strokeWidth: 2 },
          },
          labels: [
            {
              attrs: {
                text: {
                  text: "connect",
                  fill: "#374151",
                  fontSize: 12,
                  fontWeight: "bold",
                },
              },
              position: 0.5,
            },
          ],
        }),
      snapLinks: { radius: 20 },
      linkPinning: false,
      markAvailable: true,
      drawGrid: true,
      gridSize: 10,
    });
    paperInstanceRef.current = paper;

    // Double-click to edit label
    paperInstanceRef.current.on("element:pointerdblclick", (cellView: any) => {
      const currentText = cellView.model.attr("label/text");
      const newText = prompt("Edit label:", currentText);
      if (newText !== null) {
        cellView.model.attr("label/text", newText);
      }
    });

    // paper.on("element:pointerdblclick", (view, evt) => {
    //   if ((evt.target as SVGElement)?.classList.contains("joint-label")) {
    //     openLabelEditor(view, paper);
    //   }
    // });

    paperInstanceRef.current.on("link:pointerdblclick", (linkView: any) => {
      const link = linkView.model as joint.dia.Link;
      const currentText = link.label(0)?.attrs?.text?.text || "";

      const newText = prompt("Edit link label:", currentText);
      if (newText !== null) {
        if (link.labels().length === 0) {
          link.appendLabel({
            attrs: {
              text: {
                text: newText,
                fill: "#374151",
                fontSize: 12,
                fontWeight: "bold",
              },
            },
            position: 0.5,
          });
        } else {
          link.label(0, {
            attrs: {
              text: {
                text: newText,
                fill: "#374151",
                fontSize: 12,
                fontWeight: "bold",
              },
            },
          });
        }
      }
    });

    paperInstanceRef.current.on("blank:pointerdown", () => {
      if (editing) saveLabel();
    });

    // Drag and drop
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", handleDrop);

    // Responsive paper
    const handleResize = () => {
      paper.setDimensions(el.clientWidth, el.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ResizeTool = joint.elementTools.Control.extend({
    children: [
      {
        tagName: "image",
        selector: "handle",
        attributes: {
          cursor: "pointer",
          width: 20,
          height: 20,
          "xlink:href":
            "https://assets.codepen.io/7589991/8725981_image_resize_square_icon.svg",
        },
      },
      {
        tagName: "rect",
        selector: "extras",
        attributes: {
          "pointer-events": "none",
          fill: "none",
          stroke: "#33334F",
          "stroke-dasharray": "2,4",
          rx: 5,
          ry: 5,
        },
      },
    ],
    getPosition: function (view: any) {
      const model = view.model;
      const { width, height } = model.size();
      return { x: width, y: height };
    },
    setPosition: function (view: any, coordinates: any) {
      const model = view.model;
      model.resize(
        Math.max(coordinates.x - 10, 1),
        Math.max(coordinates.y - 10, 1)
      );
    },
  });

  // Handle Drop Event
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer?.getData("shape/type");
    if (!type) return;

    const paper = paperInstanceRef.current;
    if (!paper) return;

    const local: any = paper.clientToLocalPoint({
      x: e.clientX,
      y: e.clientY,
    });

    createShape(type, local.x - 50, local.y - 20);
  };

  const addPorts = (shape: joint.dia.Element) => {
    shape.addPorts([
      {
        group: "top",
        attrs: {
          circle: {
            r: 6,
            fill: "#ffffff",
            stroke: "#9ca3af",
            strokeWidth: 2,
            magnet: true,
          },
        },
      },
      {
        group: "bottom",
        attrs: {
          circle: {
            r: 6,
            fill: "#ffffff",
            stroke: "#9ca3af",
            strokeWidth: 2,
            magnet: true,
          },
        },
      },
      {
        group: "left",
        attrs: {
          circle: {
            r: 6,
            fill: "#ffffff",
            stroke: "#9ca3af",
            strokeWidth: 2,
            magnet: true,
          },
        },
      },
      {
        group: "right",
        attrs: {
          circle: {
            r: 6,
            fill: "#ffffff",
            stroke: "#9ca3af",
            strokeWidth: 2,
            magnet: true,
          },
        },
      },
    ]);

    shape.prop("ports/groups", {
      top: { position: { name: "top" } },
      bottom: { position: { name: "bottom" } },
      left: { position: { name: "left" } },
      right: { position: { name: "right" } },
    });
  };

  // Create Shape Function
  const createShape = (type: string, x = 100, y = 100) => {
    if (!graphRef.current) return;

    let shape: any;
    let shapeColor: any = colors.rectangle;

    switch (type) {
      case "rectangle":
        shapeColor = colors.rectangle;
        shape = new joint.shapes.standard.Rectangle({
          position: { x, y },
          size: { width: 140, height: 70 },
          attrs: {
            body: {
              fill: shapeColor.fill,
              stroke: shapeColor.stroke,
              strokeWidth: 2,
              rx: 8,
              ry: 8,
              filter: {
                name: "dropShadow",
                args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
              },
            },
            label: {
              text: "Rectangle",
              fill: "white",
              fontSize: 13,
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
            },
          },
        });
        break;

      case "circle":
        shapeColor = colors.circle;
        shape = new joint.shapes.standard.Ellipse({
          position: { x, y },
          size: { width: 90, height: 90 },
          attrs: {
            body: {
              fill: shapeColor.fill,
              stroke: shapeColor.stroke,
              strokeWidth: 2,
              filter: {
                name: "dropShadow",
                args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
              },
            },
            label: {
              text: "Circle",
              fill: "white",
              fontSize: 13,
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
            },
          },
        });
        break;

      case "diamond":
        shapeColor = colors.diamond;
        shape = new joint.shapes.standard.Polygon({
          position: { x, y },
          size: { width: 100, height: 100 },
          attrs: {
            body: {
              refPoints: "50,0 100,50 50,100 0,50",
              fill: shapeColor.fill,
              stroke: shapeColor.stroke,
              strokeWidth: 2,
              filter: {
                name: "dropShadow",
                args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
              },
            },
            label: {
              text: "Diamond",
              fill: "white",
              fontSize: 13,
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
            },
          },
        });
        break;

      case "triangle":
        shapeColor = colors.triangle;
        shape = new joint.shapes.standard.Polygon({
          position: { x, y },
          size: { width: 100, height: 100 },
          attrs: {
            body: {
              refPoints: "50,0 100,100 0,100",
              fill: shapeColor.fill,
              stroke: shapeColor.stroke,
              strokeWidth: 2,
              filter: {
                name: "dropShadow",
                args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
              },
            },
            label: {
              text: "Triangle",
              fill: "white",
              fontSize: 13,
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
            },
          },
        });
        break;
    }

    graphRef.current.addCell(shape);
    addPorts(shape);
    shape.findView(paperInstanceRef.current).addTools(
      new joint.dia.ToolsView({
        tools: [
          new ResizeTool({
            selector: "body",
          }),
        ],
      })
    );
  };

  // Drag Start from Sidebar
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("shape/type", type);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-br from-slate-50 to-slate-100">
      {/* <div className="absolute top-1/2 left-6 -translate-y-1/2 bg-white shadow-lg border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 z-50">
        <button
          className="p-3 rounded-lg hover:bg-blue-50 transition-colors group flex-0"
          draggable
          onDragStart={(e) => onDragStart(e, "rectangle")}
          title="Rectangle"
        >
          <SquareIcon size={20} className="text-blue-600" />
        </button>

        <button
          className="p-3 rounded-lg hover:bg-green-50 transition-colors group"
          draggable
          onDragStart={(e) => onDragStart(e, "circle")}
          title="Circle"
        >
          <CircleIcon size={20} className="text-green-600" />
        </button>

        <button
          className="p-3 rounded-lg hover:bg-red-50 transition-colors group"
          draggable
          onDragStart={(e) => onDragStart(e, "diamond")}
          title="Diamond"
        >
          <DiamondIcon size={20} className="text-red-600" />
        </button>

        <button
          className="p-3 rounded-lg hover:bg-purple-50 transition-colors group"
          draggable
          onDragStart={(e) => onDragStart(e, "triangle")}
          title="Triangle"
        >
          <TriangleIcon size={20} className="text-purple-600" />
        </button>
      </div>

      <div
        ref={paperRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      ></div>
      {editing && (
        <input
          ref={inputRef}
          value={editing.value}
          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveLabel();
            if (e.key === "Escape") cancelLabel();
          }}
          style={{
            position: "fixed",
            left: editing.x,
            top: editing.y,
            width: editing.width,
            height: editing.height,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            border: "1px solid #3b82f6",
            borderRadius: 6,
            padding: "2px 6px",
            zIndex: 1000,
            outline: "none",
          }}
        />
      )} */}

      <DaigramBuilder2 />
    </div>
  );
}
