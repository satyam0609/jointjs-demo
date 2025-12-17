"use client";
import React, { useEffect, useRef } from "react";
import * as joint from "@joint/core";
import {
  SquareIcon,
  CircleIcon,
  DiamondIcon,
  TriangleIcon,
} from "lucide-react";

export default function DaigramBuilder() {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);
  const paperInstanceRef = useRef<any>(null);
  const shapeTypesRef = useRef<Map<string, string>>(new Map());
  const selectionRef = useRef<joint.dia.Element | null>(null);
  const linkInProgressRef = useRef<joint.dia.Link | null>(null);
  const isCreatingLinkRef = useRef(false);

  const editorRef = useRef<any>(null);
  const [labelEditor, setLabelEditor] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
    cellView: any;
    labelIndex: number;
    isLink: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    width: 140,
    height: 40,
    value: "",
    cellView: null,
    labelIndex: 0,
    isLink: false,
  });

  const debounceRef = useRef<any>(null);

  const debouncedSave = (
    value: string,
    cellView: any,
    labelIndex: number,
    isLink: boolean
  ) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveLabel(value, cellView, labelIndex, isLink);
    }, 300);
  };

  const saveLabel = (
    value: string,
    cellView: any,
    labelIndex: number,
    isLink: boolean
  ) => {
    if (!value.trim()) return;

    const model = cellView.model;

    if (isLink) {
      model.label(labelIndex, {
        attrs: {
          text: { text: value },
        },
      });
    } else {
      model.attr("label/text", value);
    }
  };

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

  useEffect(() => {
    if (labelEditor.visible && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
    }
  }, [labelEditor.visible]);

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
      defaultLink: () =>
        new joint.shapes.standard.Link({
          attrs: {
            line: {
              stroke: "#374151",
              strokeWidth: 2,
              targetMarker: {
                type: "classic",
                fill: "#374151",
              },
            },
          },
          router: { name: "orthogonal" },
          connector: { name: "rounded" },
        }),

      interactive: true,
      // drawGrid: true,
      // gridSize: 10,
    });
    paperInstanceRef.current = paper;

    // Check joint.linkTools available tools
    console.log("Available linkTools:", Object.keys(joint.linkTools));

    // Link Hover - Add tools
    paper.on("link:mouseenter", (linkView: joint.dia.LinkView) => {
      // Create vertices tool
      const verticesTool = new joint.linkTools.Vertices({
        vertexStyle: {
          fill: "#2563eb",
          stroke: "#fff",
          strokeWidth: 2,
          r: 6,
          cursor: "pointer",
        },
      });

      // Create remove button tool
      const removeTool = new joint.linkTools.Remove({
        distance: 50,
      });

      const toolsView = new joint.dia.ToolsView({
        tools: [verticesTool, removeTool],
      });

      linkView.addTools(toolsView);
    });
    paper.on("link:mouseleave", () => {
      paper.removeTools();
    });

    // paper.on("blank:pointerdown", () => {
    //   paper.removeTools();
    // });

    // paper.on("element:pointerdown", () => {
    //   paper.removeTools();
    // });

    // Element selection
    paper.on("element:pointerdown", (view: joint.dia.ElementView) => {
      selectElement(view);
    });

    // Clear selection on blank click
    paper.on("blank:pointerdown", () => {
      clearSelection();
    });

    // Link connection
    // paper.on("link:connect", (linkView: joint.dia.LinkView) => {
    //   if (!linkView.model.getTargetCell()) {
    //     linkView.model.remove();
    //   }
    // });

    // Double-click element to edit label
    // paper.on("element:pointerdblclick", (cellView: joint.dia.ElementView) => {
    //   const currentText = cellView.model.attr("label/text") || "";
    //   const newText = prompt("Edit label:", currentText);
    //   if (newText !== null && newText !== undefined) {
    //     cellView.model.attr("label/text", newText);
    //   }
    // });

    // Double-click link to edit label
    // paperInstanceRef.current.on("link:pointerdblclick", (linkView: any) => {
    //   console.log("triggering...........");
    //   const link = linkView.model as joint.dia.Link;
    //   const currentText = link.label(0)?.attrs?.text?.text || "";

    //   const newText = prompt("Edit link label:", currentText);
    //   if (newText !== null) {
    //     if (link.labels().length === 0) {
    //       link.appendLabel({
    //         attrs: {
    //           text: {
    //             text: newText,
    //             fill: "#374151",
    //             fontSize: 12,
    //             fontWeight: "bold",
    //           },
    //         },
    //         position: 0.5,
    //       });
    //     } else {
    //       link.label(0, {
    //         attrs: {
    //           text: {
    //             text: newText,
    //             fill: "#374151",
    //             fontSize: 12,
    //             fontWeight: "bold",
    //           },
    //         },
    //       });
    //     }
    //   }
    // });

    //Double click

    paper.on("cell:pointerdblclick", (cellView: any, evt: any) => {
      evt.stopPropagation();

      // ============================
      // ELEMENT LABEL
      // ============================
      if (cellView.model.isElement()) {
        const rawTarget = evt.target as SVGElement;
        const textEl: any =
          rawTarget.tagName === "text" ? rawTarget : rawTarget.closest("text");

        if (!textEl) return;

        openLabelEditor(cellView, textEl, 0);
        return;
      }

      // ============================
      // LINK LABEL
      // ============================
      if (cellView.model.isLink()) {
        const linkView = cellView as joint.dia.LinkView;

        // Get actual label <text> nodes
        const labelTextEls = linkView.el.querySelectorAll("text");

        if (!labelTextEls.length) return;

        // Default to first label (or detect nearest later)
        const textEl = labelTextEls[0] as SVGTextElement;
        const labelIndex = Number(textEl.getAttribute("data-label-index") || 0);

        openLabelEditor(cellView, textEl, labelIndex);
      }
    });

    // Drag and drop
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", handleDrop);

    const handleResize = () => {
      paper.setDimensions(el.clientWidth, el.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("dragover", (e) => e.preventDefault());
      el.removeEventListener("drop", handleDrop);
    };
  }, []);

  function openLabelEditor(
    cellView: any,
    textEl: SVGTextElement,
    labelIndex: number
  ) {
    const bbox = textEl.getBoundingClientRect();

    setLabelEditor({
      visible: true,
      x: bbox.left,
      y: bbox.top,
      width: Math.max(140, bbox.width + 20),
      height: Math.max(40, bbox.height + 20),
      value: textEl.textContent || "",
      cellView,
      labelIndex,
      isLink: cellView.model.isLink(),
    });
  }

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

  // Selection helpers
  function highlightSelection(view: joint.dia.ElementView) {
    joint.highlighters.mask.add(view, "root", "selection", {
      padding: 6,
      attrs: {
        stroke: "#2563eb",
        "stroke-width": 2,
        "stroke-dasharray": "4,2",
        fill: "none",
      },
    });
  }

  function unhighlightSelection(view: joint.dia.ElementView) {
    joint.highlighters.mask.remove(view, "selection");
  }

  function selectElement(view: joint.dia.ElementView) {
    if (selectionRef.current) {
      const prevView = paperInstanceRef.current.findViewByModel(
        selectionRef.current
      );
      if (prevView) {
        unhighlightSelection(prevView);
        removeTools(prevView);
      }
    }

    selectionRef.current = view.model;
    highlightSelection(view);
    // addLinkTool(view);
    const ResizeToolsView = new joint.dia.ToolsView({
      tools: [
        new (createResizeTool("nw", "nwse-resize"))(),
        new (createResizeTool("n", "ns-resize"))(),
        new (createResizeTool("ne", "nesw-resize"))(),
        new (createResizeTool("e", "ew-resize"))(),
        new (createResizeTool("se", "nwse-resize"))(),
        new (createResizeTool("s", "ns-resize"))(),
        new (createResizeTool("sw", "nesw-resize"))(),
        new (createResizeTool("w", "ew-resize"))(),
        createLinkTool(),
      ],
    });

    view.addTools(ResizeToolsView);
  }

  function clearSelection() {
    if (selectionRef.current) {
      const view = paperInstanceRef.current.findViewByModel(
        selectionRef.current
      );
      if (view) {
        unhighlightSelection(view);
        removeTools(view);
      }
    }

    selectionRef.current = null;
  }

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
              magnet: "passive",

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
              "data-label-index": 0,
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
              magnet: "passive",
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
              "data-label-index": 0,
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
              magnet: "passive",
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
              "data-label-index": 0,
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
              magnet: "passive",
              filter: {
                name: "dropShadow",
                args: { dx: 0, dy: 2, blur: 4, opacity: 0.3 },
              },
            },
            label: {
              text: "Triangle",
              fill: "white",
              fontSize: 13,
              fontWeight: "bold",
              fontFamily: "Inter, sans-serif",
              "data-label-index": 0,
            },
          },
        });
        break;
    }

    graphRef.current.addCell(shape);
    shapeTypesRef.current.set(shape.id, type);

    const ResizeToolsView = new joint.dia.ToolsView({
      tools: [
        new (createResizeTool("nw", "nwse-resize"))(),
        new (createResizeTool("n", "ns-resize"))(),
        new (createResizeTool("ne", "nesw-resize"))(),
        new (createResizeTool("e", "ew-resize"))(),
        new (createResizeTool("se", "nwse-resize"))(),
        new (createResizeTool("s", "ns-resize"))(),
        new (createResizeTool("sw", "nesw-resize"))(),
        new (createResizeTool("w", "ew-resize"))(),
      ],
    });

    shape.findView(paperInstanceRef.current).addTools(ResizeToolsView);
  };

  // Tool helpers

  function removeTools(view: joint.dia.ElementView) {
    view.removeTools();
  }

  function autoAnchorName(
    el: any,
    referenceBBox: {
      x: number;
      y: number;
      width: number;
      height: number;
      cx: number;
      cy: number;
    }
  ): string {
    const bbox = el.model ? el.model.getBBox() : el.getBBox();

    const points: Record<string, { x: number; y: number }> = {
      center: { x: bbox.cx, y: bbox.cy },
      top: { x: bbox.cx, y: bbox.y },
      bottom: { x: bbox.cx, y: bbox.y + bbox.height },
      left: { x: bbox.x, y: bbox.cy },
      right: { x: bbox.x + bbox.width, y: bbox.cy },
      "top-left": { x: bbox.x, y: bbox.y },
      "top-right": { x: bbox.x + bbox.width, y: bbox.y },
      "bottom-left": { x: bbox.x, y: bbox.y + bbox.height },
      "bottom-right": { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
    };

    const ref = { x: referenceBBox.cx, y: referenceBBox.cy };
    let best = "center";
    let minDist = Infinity;

    for (const [name, point] of Object.entries(points)) {
      const dx = point.x - ref.x;
      const dy = point.y - ref.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        best = name;
      }
    }

    return best;
  }

  const createLinkTool = () =>
    new joint.elementTools.Button({
      x: "100%",
      y: "50%",
      offset: { x: 10, y: -10 },

      markup: [
        {
          tagName: "circle",
          selector: "button",
          attributes: { r: 12, fill: "#2563eb", cursor: "pointer" },
        },
        {
          tagName: "path",
          selector: "icon",
          attributes: {
            d: "M5 12h14M12 5v14",
            stroke: "#fff",
            "stroke-width": 2,
            fill: "none",
            "stroke-linecap": "round",
          },
        },
      ],

      action(evt, view) {
        evt.stopPropagation();

        const paper = paperInstanceRef.current;
        const graph = view.model.graph;
        if (!paper || !graph) return;

        const link = new joint.shapes.standard.Link({
          source: {
            id: view.model.id,
            anchor: { name: "center" },
          },
          target: { x: 0, y: 0 },
          router: { name: "orthogonal" },
          connector: { name: "rounded" },
          intractive: true,
          attrs: {
            line: {
              stroke: "#374151",
              strokeWidth: 2,
              targetMarker: { type: "classic", fill: "#374151" },
              pointerEvents: "stroke",
            },
          },
        });

        link.appendLabel({
          position: 0.5,
          attrs: {
            text: {
              text: "Link",
              fill: "#000",
              fontSize: 12,
              fontWeight: "bold",
              "data-label-index": 0,
            },
            rect: {
              fill: "#fff",
              stroke: "#d1d5db",
              strokeWidth: 1,
              rx: 4,
              ry: 4,
              padding: 5,
            },
          },
        });

        graph.addCell(link);
        linkInProgressRef.current = link;
        isCreatingLinkRef.current = true;

        const linkView = link.findView(paper) as joint.dia.LinkView;
        linkView.startArrowheadMove("target", { ui: true });

        let lastHighlightedView: joint.dia.ElementView | null = null;

        const pointerMoveHandler = (e: PointerEvent) => {
          if (!linkInProgressRef.current) return;

          const p = paper.clientToLocalPoint({
            x: e.clientX,
            y: e.clientY,
          });

          linkInProgressRef.current.target(p);

          const views = paper.findViewsFromPoint(p);
          const elementView = views.find((v: any) => v.model.isElement) as
            | joint.dia.ElementView
            | undefined;

          if (lastHighlightedView && lastHighlightedView !== elementView) {
            joint.highlighters.mask.remove(lastHighlightedView, "target");
            lastHighlightedView = null;
          }

          if (elementView && elementView !== lastHighlightedView) {
            joint.highlighters.mask.add(elementView, "root", "target", {
              padding: 6,
              attrs: {
                stroke: "#10b981",
                "stroke-width": 3,
                "stroke-dasharray": "4,2",
                fill: "none",
              },
            });
            lastHighlightedView = elementView;
          }
        };

        const pointerUpHandler = (e: PointerEvent) => {
          if (!linkInProgressRef.current) return;

          const p = paper.clientToLocalPoint({
            x: e.clientX,
            y: e.clientY,
          });

          const views = paper.findViewsFromPoint(p);
          const targetView = views.find((v: any) => v.model.isElement) as
            | joint.dia.ElementView
            | undefined;

          if (lastHighlightedView) {
            joint.highlighters.mask.remove(lastHighlightedView, "target");
            lastHighlightedView = null;
          }

          const sourceEl: any = view.model;

          if (!targetView) {
            linkInProgressRef.current.remove();
            cleanup();
            return;
          }

          const targetEl: any = targetView.model;

          if (targetEl.id === sourceEl.id) {
            const bbox = sourceEl.getBBox();

            const cx = bbox.x + bbox.width / 2;
            const topY = bbox.y;

            if (!isFinite(cx) || !isFinite(topY)) {
              linkInProgressRef.current.remove();
              cleanup();
              return;
            }

            linkInProgressRef.current.target({
              id: sourceEl.id,
              anchor: { name: "top" },
            });

            linkInProgressRef.current.vertices([
              { x: cx + 50, y: topY - 70 },
              { x: cx - 50, y: topY - 70 },
            ]);
          } else {
            const sourceAnchor = autoAnchorName(sourceEl, targetEl.getBBox());
            const targetAnchor = autoAnchorName(targetEl, sourceEl.getBBox());

            linkInProgressRef.current.source({
              id: sourceEl.id,
              anchor: { name: sourceAnchor },
            });

            linkInProgressRef.current.target({
              id: targetEl.id,
              anchor: { name: targetAnchor },
            });
          }

          cleanup();
        };

        const cleanup = () => {
          paper.el.removeEventListener("pointermove", pointerMoveHandler);
          paper.el.removeEventListener("pointerup", pointerUpHandler);
          isCreatingLinkRef.current = false;
          linkInProgressRef.current = null;
        };

        paper.el.addEventListener("pointermove", pointerMoveHandler);
        paper.el.addEventListener("pointerup", pointerUpHandler);
      },
    });

  const createResizeTool = (direction: string, cursor: string) =>
    joint.elementTools.Control.extend({
      children: [
        {
          tagName: "circle",
          selector: "handle",
          attributes: {
            r: 8,
            fill: "transparent",
            stroke: "transparent",
            "stroke-width": 2,
            cursor,
          },
        },
      ],

      getPosition(view: any) {
        const { width, height } = view.model.size();

        const positions: Record<string, any> = {
          nw: { x: 0, y: 0 },
          n: { x: width / 2, y: 0 },
          ne: { x: width, y: 0 },
          e: { x: width, y: height / 2 },
          se: { x: width, y: height },
          s: { x: width / 2, y: height },
          sw: { x: 0, y: height },
          w: { x: 0, y: height / 2 },
        };

        return positions[direction];
      },

      setPosition(view: any, coords: any) {
        const model = view.model;
        const minSize = 40;

        let { x, y } = model.position();
        let { width, height } = model.size();

        switch (direction) {
          case "e":
            width = Math.max(coords.x, minSize);
            break;

          case "s":
            height = Math.max(coords.y, minSize);
            break;

          case "se":
            width = Math.max(coords.x, minSize);
            height = Math.max(coords.y, minSize);
            break;

          case "w": {
            const dx = coords.x;
            const newWidth = Math.max(width - dx, minSize);
            x += width - newWidth;
            width = newWidth;
            break;
          }

          case "n": {
            const dy = coords.y;
            const newHeight = Math.max(height - dy, minSize);
            y += height - newHeight;
            height = newHeight;
            break;
          }

          case "nw": {
            const dx = coords.x;
            const dy = coords.y;

            const newWidth = Math.max(width - dx, minSize);
            const newHeight = Math.max(height - dy, minSize);

            x += width - newWidth;
            y += height - newHeight;

            width = newWidth;
            height = newHeight;
            break;
          }

          case "ne": {
            const dy = coords.y;
            const newHeight = Math.max(height - dy, minSize);
            y += height - newHeight;

            width = Math.max(coords.x, minSize);
            height = newHeight;
            break;
          }

          case "sw": {
            const dx = coords.x;
            const newWidth = Math.max(width - dx, minSize);
            x += width - newWidth;

            width = newWidth;
            height = Math.max(coords.y, minSize);
            break;
          }
        }

        model.position(x, y);
        model.resize(width, height);
      },
    });

  // Drag Start from Sidebar
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("shape/type", type);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 bg-white shadow-lg border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 z-50">
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

      {/* Paper */}
      <div
        ref={paperRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      ></div>
      {labelEditor.visible && (
        <textarea
          ref={editorRef}
          value={labelEditor.value}
          onChange={(e) => {
            setLabelEditor((p) => ({ ...p, value: e.target.value }));
            debouncedSave(
              e.target.value,
              labelEditor.cellView,
              labelEditor.labelIndex,
              labelEditor.isLink
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              saveLabel(
                labelEditor.value,
                labelEditor.cellView,
                labelEditor.labelIndex,
                labelEditor.isLink
              );
              setLabelEditor((p) => ({ ...p, visible: false }));
            }
          }}
          onBlur={() => {
            saveLabel(
              labelEditor.value,
              labelEditor.cellView,
              labelEditor.labelIndex,
              labelEditor.isLink
            );
            setLabelEditor((p) => ({ ...p, visible: false }));
          }}
          style={{
            position: "fixed",
            left: labelEditor.x,
            top: labelEditor.y,
            width: labelEditor.width,
            height: labelEditor.height,
            resize: "none",
            padding: "6px",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            lineHeight: "1.3",
            zIndex: 9999,
            borderRadius: 6,
            border: "1px solid #cbd5f5",
            outline: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        />
      )}
    </div>
  );
}
