"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const isLabelHovered = useRef<any>(null);

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

  // const saveLabel = (
  //   value: string,
  //   cellView: any,
  //   labelIndex: number,
  //   isLink: boolean
  // ) => {
  //   const model = cellView.model;

  //   if (isLink) {
  //     model.label(labelIndex, {
  //       attrs: {
  //         text: { text: value },
  //       },
  //     });
  //   } else {
  //     // Update text with proper word wrapping and overflow handling
  //     model.attr("label/text", value);
  //     model.attr("label/textWrap", {
  //       width: -10, // Negative value means percentage (90% of shape width)
  //       height: -10, // 90% of shape height
  //       ellipsis: false, // Don't show ellipsis
  //     });
  //     model.attr("label/style", {
  //       overflow: "hidden",
  //       textOverflow: "clip",
  //     });
  //   }
  // };

  // function measureTextWidth(
  //   text: string,
  //   font = "bold 12px Inter, sans-serif"
  // ) {
  //   const canvas = document.createElement("canvas");
  //   const ctx = canvas.getContext("2d")!;
  //   ctx.font = font;
  //   return ctx.measureText(text || " ").width;
  // }

  // const saveLabel = (
  //   value: string,
  //   cellView: any,
  //   labelIndex: number,
  //   isLink: boolean
  // ) => {
  //   const model = cellView.model;

  //   if (isLink) {
  //     const textWidth = measureTextWidth(value);

  //     model.label(labelIndex, {
  //       attrs: {
  //         labelText: {
  //           text: value,
  //           fontSize: 12,
  //           fill: "#000000",
  //           // textAnchor: "middle",
  //           // textVerticalAnchor: "middle",
  //           // width: textWidth,
  //         },
  //         labelBody: {
  //           ref: "labelText",
  //           // center rect around text with padding
  //           x: `calc(x-${textWidth / 2 - 6})`,
  //           y: "calc(y-2)",
  //           width: textWidth + 8,
  //           height: "calc(h+4)",
  //           fill: "#ffffff",
  //           stroke: "#000000",
  //           strokeWidth: 1,
  //           rx: 4,
  //           ry: 4,
  //         },
  //       },
  //     });
  //   } else {
  //     // element logic as you have
  //     model.attr("label/text", value);
  //     model.attr("label/textWrap", {
  //       width: -10, // Negative value means percentage (90% of shape width)
  //       height: -10, // 90% of shape height
  //       ellipsis: false, // Don't show ellipsis
  //     });
  //     model.attr("label/style", {
  //       overflow: "hidden",
  //       textOverflow: "clip",
  //     });
  //   }
  // };

  function measureTextWidth(
    text: string,
    font = "bold 12px Inter, sans-serif"
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = font;
    return ctx.measureText(text || " ").width;
  }

  const saveLabel = (
    value: string,
    cellView: any,
    labelIndex: number,
    isLink: boolean
  ) => {
    const model = cellView.model;

    if (isLink) {
      const textWidth = measureTextWidth(value);
      const paddingX = 16; // total horizontal padding
      const paddingY = 8; // total vertical padding
      const lineHeight = 16; // approx for fontSize 12

      model.label(labelIndex, {
        size: {
          width: textWidth + paddingX,
          height: lineHeight + paddingY,
        },
        attrs: {
          // must match selector name in markup
          labelText: { text: value },
        },
      });
    } else {
      model.attr("label/text", value);
      model.attr("label/textWrap", {
        width: -10,
        height: -10,
        ellipsis: false,
      });
      model.attr("label/style", {
        overflow: "hidden",
        textOverflow: "clip",
      });
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

  function hideLabel(cellView: any, isLink: boolean, labelIndex: number) {
    const model = cellView.model;

    if (isLink) {
      model.label(labelIndex, {
        attrs: {
          text: { opacity: 0 },
          rect: { opacity: 0 },
        },
      });
    } else {
      model.attr("label/opacity", 0);
    }
  }

  function showLabel(cellView: any, isLink: boolean, labelIndex: number) {
    const model = cellView.model;

    if (isLink) {
      model.label(labelIndex, {
        attrs: {
          text: { opacity: 1 },
          rect: { opacity: 1 },
        },
      });
    } else {
      model.attr("label/opacity", 1);
    }
  }

  function detectLabelUnderPointer(
    paper: joint.dia.Paper,
    evt: PointerEvent
  ):
    | { type: "element"; element: joint.dia.Element }
    | { type: "link"; link: joint.dia.Link; labelIndex: number }
    | null {
    // Pointer in screen space
    const clientPoint = { x: evt.clientX, y: evt.clientY };

    // ----------------------------
    // LINK LABELS (Core-safe)
    // ----------------------------
    const links = paper.model.getLinks();

    for (const link of links) {
      const linkView = link.findView(paper) as joint.dia.LinkView;
      if (!linkView) continue;

      // Each label renders as <text>
      const textEls = linkView.el.querySelectorAll("text");

      for (let i = 0; i < textEls.length; i++) {
        const textEl = textEls[i] as SVGTextElement;
        const rect = textEl.getBoundingClientRect();

        if (
          clientPoint.x >= rect.left &&
          clientPoint.x <= rect.right &&
          clientPoint.y >= rect.top &&
          clientPoint.y <= rect.bottom
        ) {
          return {
            type: "link",
            link,
            labelIndex: i,
          };
        }
      }
    }

    // ----------------------------
    // ELEMENT LABELS
    // ----------------------------
    const views = paper.findViewsFromPoint(
      paper.clientToLocalPoint(clientPoint)
    );

    for (const view of views) {
      if (!view.model.isElement()) continue;

      return {
        type: "element",
        element: view.model,
      };
    }

    return null;
  }

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
    });
    paperInstanceRef.current = paper;

    // Check joint.linkTools available tools
    console.log("Available linkTools:", Object.keys(joint.linkTools));

    // Link Hover - Add tools
    paper.on("link:mouseenter", (linkView: joint.dia.LinkView, evt: any) => {
      // Create vertices tool
      console.log(linkView, "---------link");
      // const paper = paperInstanceRef.current;

      // // 🔍 Detect if pointer is on a LINK LABEL
      // const hit = detectLabelUnderPointer(paper, evt);

      // // ❌ Pointer is on link label → DO NOT show tools
      // if (hit?.type === "link" && hit.link.id === linkView.model.id) {
      //   return;
      // }
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

    // Element selection
    paper.on("element:pointerdown", (view: joint.dia.ElementView) => {
      selectElement(view);
    });

    // Clear selection on blank click
    paper.on("blank:pointerdown", () => {
      clearSelection();
    });

    //Double click
    paper.on("cell:pointerdblclick", (cellView: any, evt: any) => {
      evt.stopPropagation();
      console.log(cellView.model, "---double click");
      // ============================
      // ELEMENT LABEL
      // ============================
      if (cellView.model.isElement()) {
        const rawTarget = evt.target as SVGElement;
        const textEl =
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
    // textEl: SVGTextElement,
    textEl: any,

    labelIndex: number
  ) {
    const model = cellView.model;
    const isLink = model.isLink();

    let value = "";
    if (isLink) {
      value = model.label(labelIndex)?.attrs?.text?.text || "";
    } else {
      value = model.attr("label/text") || "";
    }

    if (isLink) {
      const bbox = textEl.getBoundingClientRect();
      setLabelEditor({
        visible: true,
        x: bbox.left,
        y: bbox.top,
        width: Math.max(140, bbox.width + 20),
        height: Math.max(40, bbox.height + 20),

        value,
        cellView,
        labelIndex,
        isLink: true,
      });
    } else {
      // For elements, get the shape's bounding box
      const { width, height } = cellView.model.size();
      const { x, y } = cellView.model.position();

      const paperRect = paperRef.current!.getBoundingClientRect();

      console.log(width, height, "-----shapebox config");

      setLabelEditor({
        visible: true,
        x: paperRect.left + x,
        y: paperRect.top + y,
        width,
        height,
        value,
        cellView,
        labelIndex,
        isLink: false,
      });
    }
    hideLabel(cellView, isLink, labelIndex);
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
        "stroke-width": 1,
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
              textWrap: {
                width: -10,
                height: -10,
                ellipsis: false,
              },
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
              textWrap: {
                width: -10,
                height: -10,
                ellipsis: false,
              },
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
              textWrap: {
                width: -10,
                height: -10,
                ellipsis: false,
              },
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
              textWrap: {
                width: -10,
                height: -10,
                ellipsis: false,
              },
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

        // link.appendLabel({
        //   position: 100,
        //   attrs: {
        //     text: {
        //       text: "Link",
        //       fill: "#000",
        //       fontSize: 12,
        //       fontWeight: "bold",
        //       "data-label-index": 0,
        //       textAnchor: "center",
        //     },
        //     rect: {
        //       fill: "#fff",
        //       stroke: "#d1d5db",
        //       strokeWidth: 1,
        //       rx: 4,
        //       ry: 4,

        //       padding: 5,
        //     },
        //   },
        // });

        // link.appendLabel({
        //   position: { distance: 0.5 },
        //   markup: [
        //     { tagName: "rect", selector: "labelBody" },
        //     { tagName: "text", selector: "labelText" },
        //   ],
        //   attrs: {
        //     labelText: {
        //       text: "Link",
        //       fontSize: 12,
        //       fill: "#000000",
        //       textAnchor: "middle",
        //       textVerticalAnchor: "middle",
        //       // Let text compute its own size
        //       textWrap: {
        //         width: null,
        //         height: null,
        //         ellipsis: false,
        //       },
        //     },
        //     labelBody: {
        //       ref: "labelText",
        //       // center rect around text with padding
        //       x: "calc(x-4)",
        //       y: "calc(y-2)",
        //       width: "calc(w+8)",
        //       height: "calc(h+4)",
        //       fill: "#ffffff",
        //       stroke: "#000000",
        //       strokeWidth: 1,
        //       rx: 4,
        //       ry: 4,
        //     },
        //   },
        // });

        // link.appendLabel({
        //   position: { distance: 0.5 },
        //   markup: [
        //     { tagName: "rect", selector: "labelBody" },
        //     { tagName: "text", selector: "labelText" },
        //   ],
        //   attrs: {
        //     labelText: {
        //       text: "Link",
        //       fontSize: 12,
        //       fill: "#000000",
        //       textAnchor: "middle",
        //       textVerticalAnchor: "middle",
        //     },
        //     labelBody: {
        //       ref: "labelText",
        //       x: "calc(x - 4)", // simple padding
        //       y: "calc(y - 2)",
        //       width: "calc(w + 8)", // grow with text
        //       height: "calc(h + 4)",
        //       fill: "#ffffff",
        //       stroke: "#000000",
        //       strokeWidth: 1,
        //       rx: 4,
        //       ry: 4,
        //     },
        //   },
        // });

        link.appendLabel({
          position: { distance: 0.5 },
          size: { width: 60, height: 24 }, // initial
          markup: [
            { tagName: "rect", selector: "labelBody" },
            { tagName: "text", selector: "labelText" },
          ],
          attrs: {
            labelBody: {
              // center rect around label origin
              width: "calc(w)",
              height: "calc(h)",
              x: "calc(w/-2)",
              y: "calc(h/-2)",
              fill: "#ffffff",
              stroke: "#000000",
              strokeWidth: 1,
              rx: 4,
              ry: 4,
            },
            labelText: {
              text: "Link",
              fill: "#000000",
              fontSize: 12,
              textAnchor: "middle",
              textVerticalAnchor: "middle",
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
                "stroke-width": 1,
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
          onFocus={() => setIsFocused(true)}
          ref={editorRef}
          value={labelEditor.value}
          onChange={(e) => {
            const newValue = e.target.value;
            setLabelEditor((p) => ({ ...p, value: newValue }));

            debouncedSave(
              newValue,
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
              showLabel(
                labelEditor.cellView,
                labelEditor.isLink,
                labelEditor.labelIndex
              );
              setLabelEditor((p) => ({ ...p, visible: false }));
            }
            if (e.key === "Escape") {
              showLabel(
                labelEditor.cellView,
                labelEditor.isLink,
                labelEditor.labelIndex
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
            showLabel(
              labelEditor.cellView,
              labelEditor.isLink,
              labelEditor.labelIndex
            );

            setLabelEditor((p) => ({ ...p, visible: false }));
            setIsFocused(false);
          }}
          className="overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            position: "fixed",
            left: labelEditor.x,
            top: labelEditor.y,
            width: labelEditor.width,
            height: labelEditor.height,
            resize: "none",
            boxSizing: "border-box",
            padding: labelEditor.isLink ? "6px" : "12px",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
            lineHeight: "1.5",
            textAlign: "center",
            color: labelEditor.isLink ? "black" : "white",
            background: labelEditor.isLink ? "white" : "transparent",
            zIndex: 9999,
            borderRadius: labelEditor.isLink ? 6 : 8,
            border: labelEditor.isLink ? "2px solid #2563eb" : "none",
            outline: "none",
            boxShadow: labelEditor.isLink
              ? "0 4px 10px rgba(0,0,0,0.1)"
              : "none",
          }}
        />
      )}
    </div>
  );
}
