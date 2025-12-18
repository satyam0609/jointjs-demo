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

      // prevent links from ending in blank space
      linkPinning: false,

      // snap to ports within 20px
      snapLinks: { radius: 20 },

      // optional: only allow connection if there is a valid target magnet
      validateConnection: (
        cellViewS,
        magnetS,
        cellViewT,
        magnetT,
        end,
        linkView
      ) => {
        if (!magnetT) return false;
        return magnetT.getAttribute("magnet") !== "passive";
      },

      defaultLink: () => {
        const link = new joint.shapes.standard.Link({
          router: { name: "orthogonal" },
          connector: { name: "rounded" },
          attrs: {
            line: {
              stroke: "#374151",
              strokeWidth: 2,
              targetMarker: { type: "classic", fill: "#374151" },
              pointerEvents: "stroke",
            },
          },
        });

        // same label as in createLinkTool
        link.appendLabel({
          position: { distance: 0.5 },
          size: { width: 60, height: 24 },
          markup: [
            { tagName: "rect", selector: "labelBody" },
            { tagName: "text", selector: "labelText" },
          ],
          attrs: {
            labelBody: {
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

        return link;
      },

      interactive: true,
    });

    paperInstanceRef.current = paper;

    // Check joint.linkTools available tools
    console.log("Available linkTools:", Object.keys(joint.linkTools));

    // paper.on("link:pointerup", (linkView: joint.dia.LinkView) => {
    //   const link = linkView.model as joint.dia.Link;
    //   const target = link.get("target");

    //   // if user released on blank (no element/port)
    //   if (!target || (!target.id && !target.port)) {
    //     link.remove();
    //   }
    // });

    paper.on("link:pointerdown", (linkView: joint.dia.LinkView) => {
      isCreatingLinkRef.current = true;
      linkInProgressRef.current = linkView.model as joint.dia.Link;
    });

    paper.on("link:pointerup", (linkView: joint.dia.LinkView) => {
      // your existing cleanup
      const link = linkView.model as joint.dia.Link;
      const target = link.get("target");
      if (!target || (!target.id && !target.port)) {
        link.remove();
      }

      // reset drag flags
      isCreatingLinkRef.current = false;
      linkInProgressRef.current = null;
    });

    // graph.on("change:target change:source", (link: joint.dia.Link) => {
    //   const src = link.get("source");
    //   const tgt = link.get("target");
    //   console.log("running this ");

    //   // 2) self-link loop
    //   if (src && tgt && src.id && tgt.id && src.id === tgt.id) {
    //     const element = graph.getCell(src.id) as joint.dia.Element;
    //     if (!element) return;

    //     const bbox = element.getBBox();
    //     const cx = bbox.x + bbox.width / 2;
    //     const topY = bbox.y;

    //     const offsetX = 60;
    //     const offsetY = 70;

    //     link.vertices([
    //       { x: cx, y: topY - offsetY },
    //       { x: cx - offsetX, y: topY - offsetY },
    //     ]);

    //     link.source({ id: element.id, anchor: { name: "top" } });
    //     link.target({ id: element.id, anchor: { name: "left" } });
    //   }
    // });

    // graph.on("change:target change:source", (link: joint.dia.Link) => {
    //   const src = link.get("source");
    //   const tgt = link.get("target");

    //   if (!src || !tgt || !src.id || !tgt.id) return;

    //   const sameElement = src.id === tgt.id;
    //   const hasPorts = !!src.port && !!tgt.port;

    //   if (sameElement && hasPorts) {
    //     const element = graphRef.current.getCell(src.id) as joint.dia.Element;
    //     if (!element) return;

    //     const bbox = element.getBBox();
    //     const cx = bbox.x + bbox.width;
    //     const cy = bbox.y + bbox.height;

    //     // Distance to go outside the element
    //     const outward = 40;
    //     const sideOffset = 50;

    //     // Decide which side the target port is on
    //     // (basic heuristic using target port position)
    //     const portPosition = element.getPort(tgt.port as string)?.args
    //       ?.position;
    //     console.log(portPosition, "------getting port position");
    //     // Fallback: assume top if no info
    //     const side = portPosition?.side || "top";

    //     let v1, v2, sourceAnchor, targetAnchor;

    //     if (side === "top") {
    //       // loop above the shape, target on top edge, slightly shifted
    //       v1 = { x: cx, y: bbox.y - outward };
    //       v2 = { x: cx - sideOffset, y: bbox.y - outward };
    //       sourceAnchor = { name: "bottom" };
    //       targetAnchor = { name: "top" };
    //     } else if (side === "bottom") {
    //       v1 = { x: cx, y: bbox.y + bbox.height + outward };
    //       v2 = { x: cx - sideOffset, y: bbox.y + bbox.height + outward };
    //       sourceAnchor = { name: "top" };
    //       targetAnchor = { name: "bottom" };
    //     } else if (side === "left") {
    //       v1 = { x: bbox.x - outward, y: cy };
    //       v2 = { x: bbox.x - outward, y: cy - sideOffset };
    //       sourceAnchor = { name: "right" };
    //       targetAnchor = { name: "left" };
    //     } else {
    //       // right
    //       v1 = { x: bbox.x + bbox.width + outward, y: cy };
    //       v2 = { x: bbox.x + bbox.width + outward, y: cy - sideOffset };
    //       sourceAnchor = { name: "left" };
    //       targetAnchor = { name: "right" };
    //     }

    //     link.vertices([v1, v2]);

    //     link.source({
    //       id: element.id,
    //       port: src.port,
    //       anchor: sourceAnchor,
    //     });

    //     link.target({
    //       id: element.id,
    //       port: tgt.port,
    //       anchor: targetAnchor,
    //     });

    //     return;
    //   }

    //   // non‑self loop: clear any self‑loop vertices and use ports normally
    //   if (!sameElement && link.vertices().length) {
    //     link.vertices([]);
    //   }

    //   if (src.id && src.port) {
    //     link.source({
    //       id: src.id,
    //       port: src.port,
    //       anchor: { name: "modelCenter" },
    //     });
    //   }

    //   if (tgt.id && tgt.port) {
    //     link.target({
    //       id: tgt.id,
    //       port: tgt.port,
    //       anchor: { name: "modelCenter" },
    //     });
    //   }
    // });

    const linkConfig = function (side1, side2, x, y, h, w) {
      // Helper function to create consistent point objects
      function point(x, y) {
        return { x, y };
      }

      // Case 1: Horizontal source (left/right) to bottom target
      if ((side1 === "right" || side1 === "left") && side2 === "bottom") {
        const hOffset = side1 === "right" ? x + w + 40 : x - 40;
        return [
          point(hOffset, y + h / 2),
          point(hOffset, y + h / 2 + h),
          point(x + w / 2, y + h / 2 + h),
        ];
      }

      // Case 2: Horizontal source (left/right) to top target
      if ((side1 === "right" || side1 === "left") && side2 === "top") {
        const hOffset = side1 === "right" ? x + w + 40 : x - 40;
        console.log("top====run");
        return [
          point(hOffset, y + h / 2),
          point(hOffset, y - h / 2),
          point(x + w / 2, y - h / 2),
        ];
      }

      // Case 3: Vertical source (top/bottom) to horizontal target (left/right)
      if (
        (side1 === "top" || side1 === "bottom") &&
        (side2 === "left" || side2 === "right")
      ) {
        const vOffset = side1 === "top" ? y - 40 : y + h + 40;
        const hOffset = side2 === "left" ? x - 40 : x + w + 40;
        return [
          point(x + w / 2, vOffset),
          point(hOffset, y - 40),
          point(hOffset, y - 40),
        ];
      }

      // Case 4: Both vertical (top/bottom to top/bottom) - center connection
      if (
        (side1 === "top" || side1 === "bottom") &&
        (side2 === "top" || side2 === "bottom")
      ) {
        return [
          point(x + w / 2, y - 40),
          point(x - 40, y - 40),
          point(x - 40, y + h + 40),
          point(x + w / 2, y + h + 40),
        ];
      }

      // Default fallback: horizontal source pattern
      return [
        point(x - 40, y + h / 2),
        point(x - 40, y + h + 40),
        point(x + w + 40, y + h + 40),
        point(x + w + 40, y + h / 2),
      ];
    };

    graph.on("change:target change:source", (link: joint.dia.Link) => {
      const src = link.get("source");
      const tgt = link.get("target");

      if (!src || !tgt || !src.id || !tgt.id) return;

      const sameElement = src.id === tgt.id;
      const hasPorts = !!src.port && !!tgt.port;

      if (sameElement && hasPorts) {
        const element = graphRef.current.getCell(src.id) as joint.dia.Element;
        if (!element) return;

        const bbox = element.getBBox();
        console.log(bbox, "---box");
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;

        // Get port definitions - FIXED: use element.getPort() directly
        const srcPortDef = element.getPort(src.port as string);
        const tgtPortDef = element.getPort(tgt.port as string);

        // Extract side information from port args (stored in addOutPorts)
        const getPortSide = (portDef: any): string => {
          if (!portDef?.args?.position?.side) return "top";

          // Direct side from port args (set in addOutPorts)
          return portDef.args.position.side;
        };

        const sourceSide = getPortSide(srcPortDef);
        const targetSide = getPortSide(tgtPortDef);

        console.log(
          `Self-link: ${src.port}(${sourceSide}) → ${tgt.port}(${targetSide})`
        );

        const config = linkConfig(
          sourceSide,
          targetSide,
          bbox.x,
          bbox.y,
          bbox.height,
          bbox.width
        );

        // const outward = 50;
        // const sideOffset = 60;

        // let v1: any = config?.v1,
        //   v2: any = config?.v2;
        let sourceAnchor: any = { name: sourceSide },
          targetAnchor: any = { name: targetSide };

        // // Smart routing based on port sides
        // if (sourceSide === "top" || targetSide === "top") {
        //   // Top loop
        //   v1 = { x: cx, y: bbox.y - outward };
        //   v2 = { x: cx - sideOffset, y: bbox.y - outward };
        //   sourceAnchor = { name: sourceSide === "bottom" ? "bottom" : "top" };
        //   targetAnchor = { name: "top" };
        // } else if (sourceSide === "bottom" || targetSide === "bottom") {
        //   // Bottom loop
        //   v1 = { x: cx, y: bbox.y + bbox.height + outward };
        //   v2 = { x: cx - sideOffset, y: bbox.y + bbox.height + outward };
        //   sourceAnchor = { name: sourceSide === "top" ? "top" : "bottom" };
        //   targetAnchor = { name: "bottom" };
        // } else if (sourceSide === "left" || targetSide === "left") {
        //   // Left loop
        //   v1 = { x: bbox.x - outward, y: cy };
        //   v2 = { x: bbox.x - outward, y: cy - sideOffset };
        //   sourceAnchor = { name: sourceSide === "right" ? "right" : "left" };
        //   targetAnchor = { name: "left" };
        // } else {
        //   // Right loop (default/fallback)
        //   v1 = { x: bbox.x + bbox.width + outward, y: cy };
        //   v2 = { x: bbox.x + bbox.width + outward, y: cy - sideOffset };
        //   sourceAnchor = { name: sourceSide === "left" ? "left" : "right" };
        //   targetAnchor = { name: "right" };
        // }

        // Apply self-loop configuration
        link.vertices(config);
        link.source({
          id: element.id,
          port: src.port,
          anchor: sourceAnchor,
        });
        link.target({
          id: element.id,
          port: tgt.port,
          anchor: targetAnchor,
        });

        return; // Exit early for self-loops
      }

      // NON-SELF LINKS: Clear self-loop vertices, use standard port anchoring
      if (!sameElement && link.vertices().length > 0) {
        link.vertices([]);
      }

      if (src.id && src.port) {
        link.source({
          id: src.id,
          port: src.port,
          anchor: { name: "modelCenter" },
        });
      }

      if (tgt.id && tgt.port) {
        link.target({
          id: tgt.id,
          port: tgt.port,
          anchor: { name: "modelCenter" },
        });
      }
    });

    // Link Hover - Add tools
    paper.on("link:mouseenter", (linkView: joint.dia.LinkView, evt: any) => {
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

    graph.on("change:size", (element) => {
      const shapeType = shapeTypesRef.current.get(element.id);
      if (shapeType) {
        updatePortPositions(element, shapeType);
      }
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
        // createLinkTool(),
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
    addOutPorts(shape, type);
    graphRef.current.addCell(shape);
    shapeTypesRef.current.set(shape.id, type);
  };

  //Port function

  const getPortPositions = (
    type: string,
    width: number,
    height: number
  ): Array<{ x: number; y: number }> => {
    if (type === "rectangle") {
      // 4 sides - top, right, bottom, left
      return [
        { x: width / 2, y: 0 }, // top
        { x: width, y: height / 2 }, // right
        { x: width / 2, y: height }, // bottom
        { x: 0, y: height / 2 }, // left
      ];
    }

    if (type === "circle") {
      // 4 ports for circle (can adjust as needed)
      return [
        { x: width / 2, y: 0 }, // top
        { x: width, y: height / 2 }, // right
        { x: width / 2, y: height }, // bottom
        { x: 0, y: height / 2 }, // left
      ];
    }

    if (type === "diamond") {
      // 4 sides - top, right, bottom, left
      return [
        { x: width / 2, y: 0 }, // top
        { x: width, y: height / 2 }, // right
        { x: width / 2, y: height }, // bottom
        { x: 0, y: height / 2 }, // left
      ];
    }

    if (type === "triangle") {
      // 3 sides - top, bottom-right, bottom-left
      return [
        { x: width / 2, y: 0 }, // top
        { x: (3 * width) / 4, y: height / 2 }, // bottom-right
        { x: width / 4, y: height / 2 }, // bottom-left
      ];
    }

    return [];
  };

  // const addOutPorts = (shape: joint.dia.Element, type: string) => {
  //   const { width, height } = shape.size();
  //   const portPositions = getPortPositions(type, width, height);

  //   // Create ports based on the number of sides
  //   const ports = portPositions.map((_, i) => ({
  //     id: `out-${i}`,
  //     group: "out",
  //   }));

  //   shape.addPorts(ports);

  //   shape.prop("ports/groups/out", {
  //     position: (ports: any[], elBBox: any) => {
  //       return ports.map((port, i) => {
  //         const pos = portPositions[i];
  //         return { x: pos.x, y: pos.y };
  //       });
  //     },
  //     attrs: {
  //       circle: {
  //         r: 6,
  //         magnet: true,
  //         fill: "#000",
  //         stroke: "#fff",
  //         "stroke-width": 2,
  //       },
  //     },
  //   });
  // };

  const addOutPorts = (shape: joint.dia.Element, type: string) => {
    const { width, height } = shape.size();
    const portPositions = getPortPositions(type, width, height);

    const ports = portPositions.map((pos, i) => {
      let side: "top" | "right" | "bottom" | "left" = "top";
      if (pos.y === 0) side = "top";
      else if (pos.y === height) side = "bottom";
      else if (pos.x === 0) side = "left";
      else if (pos.x === width) side = "right";

      return {
        id: `out-${i}`,
        group: "out",
        args: {
          position: { side }, // 👈 store side metadata here
        },
      };
    });

    shape.addPorts(ports);

    shape.prop("ports/groups/out", {
      position: (ports: any[], elBBox: any) => {
        return ports.map((port, i) => {
          const pos = portPositions[i];
          return { x: pos.x, y: pos.y };
        });
      },
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          fill: "#000",
          stroke: "#fff",
          "stroke-width": 2,
        },
      },
    });
  };

  const updatePortPositions = (shape: joint.dia.Element, type: string) => {
    const { width, height } = shape.size();
    const portPositions = getPortPositions(type, width, height);

    // Update the port positions dynamically
    shape.prop("ports/groups/out/position", (ports: any[], elBBox: any) => {
      return ports.map((port, i) => {
        const pos = portPositions[i];
        return { x: pos.x, y: pos.y };
      });
    });
  };

  function removeTools(view: joint.dia.ElementView) {
    view.removeTools();
  }

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
