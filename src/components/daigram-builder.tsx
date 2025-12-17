// "use client";
// import React, { useEffect, useRef } from "react";
// import * as joint from "@joint/core";
// import {
//   SquareIcon,
//   CircleIcon,
//   DiamondIcon,
//   TriangleIcon,
// } from "lucide-react";

// export default function DaigramBuilder() {
//   const paperRef = useRef<HTMLDivElement | null>(null);
//   const graphRef = useRef<any>(null);
//   const paperInstanceRef = useRef<any>(null);

//   const inputRef = useRef<HTMLInputElement>(null);

//   const [editing, setEditing] = React.useState<{
//     view: joint.dia.ElementView | null;
//     value: string;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   } | null>(null);

//   // Color scheme for classy design
//   const colors = {
//     rectangle: {
//       fill: "#2563eb",
//       stroke: "#1e40af",
//       shadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
//     },
//     circle: {
//       fill: "#059669",
//       stroke: "#065f46",
//       shadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
//     },
//     diamond: {
//       fill: "#dc2626",
//       stroke: "#7f1d1d",
//       shadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
//     },
//     triangle: {
//       fill: "#9333ea",
//       stroke: "#581c87",
//       shadow: "0 4px 12px rgba(147, 51, 234, 0.3)",
//     },
//   };

//   // Initialize Paper & Graph
//   useEffect(() => {
//     const el = paperRef.current;
//     if (!el) return;

//     const graph = new joint.dia.Graph();
//     graphRef.current = graph;

//     const paper = new joint.dia.Paper({
//       el,
//       model: graph,
//       width: el.clientWidth,
//       height: el.clientHeight,
//       interactive: (cellView, eventName) => {
//         if (cellView.model.isLink()) return true;
//         const target = (eventName as any)?.target as HTMLElement;
//         const isPort = target?.closest("[magnet]") != null;
//         if (isPort) return { elementMove: false, addLinkFromMagnet: true };
//         return { elementMove: true };
//       },

//       drawGrid: true,
//       gridSize: 10,
//     });
//     paperInstanceRef.current = paper;

//     // Double-click to edit label
//     paperInstanceRef.current.on("element:pointerdblclick", (cellView: any) => {
//       const currentText = cellView.model.attr("label/text");
//       const newText = prompt("Edit label:", currentText);
//       if (newText !== null) {
//         cellView.model.attr("label/text", newText);
//       }
//     });

//     // paper.on("element:pointerdblclick", (view, evt) => {
//     //   if ((evt.target as SVGElement)?.classList.contains("joint-label")) {
//     //     openLabelEditor(view, paper);
//     //   }
//     // });

//     paperInstanceRef.current.on("link:pointerdblclick", (linkView: any) => {
//       const link = linkView.model as joint.dia.Link;
//       const currentText = link.label(0)?.attrs?.text?.text || "";

//       const newText = prompt("Edit link label:", currentText);
//       if (newText !== null) {
//         if (link.labels().length === 0) {
//           link.appendLabel({
//             attrs: {
//               text: {
//                 text: newText,
//                 fill: "#374151",
//                 fontSize: 12,
//                 fontWeight: "bold",
//               },
//             },
//             position: 0.5,
//           });
//         } else {
//           link.label(0, {
//             attrs: {
//               text: {
//                 text: newText,
//                 fill: "#374151",
//                 fontSize: 12,
//                 fontWeight: "bold",
//               },
//             },
//           });
//         }
//       }
//     });

//     // Drag and drop
//     el.addEventListener("dragover", (e) => e.preventDefault());
//     el.addEventListener("drop", handleDrop);

//     const handleResize = () => {
//       paper.setDimensions(el.clientWidth, el.clientHeight);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   //   const ResizeTool = joint.elementTools.Control.extend({
//   //     children: [
//   //       {
//   //         tagName: "image",
//   //         selector: "handle",
//   //         attributes: {
//   //           cursor: "pointer",
//   //           width: 20,
//   //           height: 20,
//   //           "xlink:href":
//   //             "https://assets.codepen.io/7589991/8725981_image_resize_square_icon.svg",
//   //         },
//   //       },
//   //       {
//   //         tagName: "rect",
//   //         selector: "extras",
//   //         attributes: {
//   //           "pointer-events": "none",
//   //           fill: "none",
//   //           stroke: "#33334F",
//   //           "stroke-dasharray": "2,4",
//   //           rx: 5,
//   //           ry: 5,
//   //         },
//   //       },
//   //     ],
//   //     getPosition: function (view) {
//   //       const model = view.model;
//   //       const { width, height } = model.size();
//   //       return { x: width, y: height };
//   //     },
//   //     setPosition: function (view, coordinates) {
//   //       const model = view.model;
//   //       model.resize(
//   //         Math.max(coordinates.x - 10, 1),
//   //         Math.max(coordinates.y - 10, 1)
//   //       );
//   //     },
//   //   });

//   // Handle Drop Event
//   const handleDrop = (e: DragEvent) => {
//     e.preventDefault();
//     const type = e.dataTransfer?.getData("shape/type");
//     if (!type) return;

//     const paper = paperInstanceRef.current;
//     if (!paper) return;

//     const local: any = paper.clientToLocalPoint({
//       x: e.clientX,
//       y: e.clientY,
//     });

//     createShape(type, local.x - 50, local.y - 20);
//   };

//   const addOutPorts = (shape: joint.dia.Element) => {
//     shape.addPorts([
//       { id: "out-top", group: "out" },
//       { id: "out-right", group: "out" },
//       { id: "out-bottom", group: "out" },
//       { id: "out-left", group: "out" },
//     ]);

//     shape.prop("ports/groups", {
//       out: {
//         position: (ports, elBBox) => {
//           return ports.map((port) => {
//             switch (port.id) {
//               case "out-top":
//                 return { x: elBBox.width / 2, y: 0 };
//               case "out-right":
//                 return { x: elBBox.width, y: elBBox.height / 2 };
//               case "out-bottom":
//                 return { x: elBBox.width / 2, y: elBBox.height };
//               case "out-left":
//                 return { x: 0, y: elBBox.height / 2 };
//             }
//           });
//         },
//         attrs: {
//           circle: {
//             r: 6,
//             magnet: true,
//             fill: "transparent",
//             stroke: "transparent",
//           },
//         },
//       },
//     });
//   };

//   // Create Shape Function
//   const createShape = (type: string, x = 100, y = 100) => {
//     if (!graphRef.current) return;

//     let shape: any;
//     let shapeColor: any = colors.rectangle;

//     switch (type) {
//       case "rectangle":
//         shapeColor = colors.rectangle;
//         shape = new joint.shapes.standard.Rectangle({
//           position: { x, y },
//           size: { width: 140, height: 70 },
//           attrs: {
//             body: {
//               fill: shapeColor.fill,
//               stroke: shapeColor.stroke,
//               strokeWidth: 2,
//               rx: 8,
//               ry: 8,
//               filter: {
//                 name: "dropShadow",
//                 args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
//               },
//             },
//             label: {
//               text: "Rectangle",
//               fill: "white",
//               fontSize: 13,
//               fontWeight: "bold",
//               fontFamily: "Inter, sans-serif",
//             },
//           },
//         });
//         break;

//       case "circle":
//         shapeColor = colors.circle;
//         shape = new joint.shapes.standard.Ellipse({
//           position: { x, y },
//           size: { width: 90, height: 90 },
//           attrs: {
//             body: {
//               fill: shapeColor.fill,
//               stroke: shapeColor.stroke,
//               strokeWidth: 2,
//               filter: {
//                 name: "dropShadow",
//                 args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
//               },
//             },
//             label: {
//               text: "Circle",
//               fill: "white",
//               fontSize: 13,
//               fontWeight: "bold",
//               fontFamily: "Inter, sans-serif",
//             },
//           },
//         });
//         break;

//       case "diamond":
//         shapeColor = colors.diamond;
//         shape = new joint.shapes.standard.Polygon({
//           position: { x, y },
//           size: { width: 100, height: 100 },
//           attrs: {
//             body: {
//               refPoints: "50,0 100,50 50,100 0,50",
//               fill: shapeColor.fill,
//               stroke: shapeColor.stroke,
//               strokeWidth: 2,
//               filter: {
//                 name: "dropShadow",
//                 args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
//               },
//             },
//             label: {
//               text: "Diamond",
//               fill: "white",
//               fontSize: 13,
//               fontWeight: "bold",
//               fontFamily: "Inter, sans-serif",
//             },
//           },
//         });
//         break;

//       case "triangle":
//         shapeColor = colors.triangle;
//         shape = new joint.shapes.standard.Polygon({
//           position: { x, y },
//           size: { width: 100, height: 100 },
//           attrs: {
//             body: {
//               refPoints: "50,0 100,100 0,100",
//               fill: shapeColor.fill,
//               stroke: shapeColor.stroke,
//               strokeWidth: 2,
//               filter: {
//                 name: "dropShadow",
//                 args: { dx: 0, dy: 2, blur: 4, opacity: 0.2 },
//               },
//             },
//             label: {
//               text: "Triangle",
//               fill: "white",
//               fontSize: 13,
//               fontWeight: "bold",
//               fontFamily: "Inter, sans-serif",
//             },
//           },
//         });
//         break;
//     }

//     graphRef.current.addCell(shape);

//     const ResizeToolsView = new joint.dia.ToolsView({
//       tools: [
//         new (createResizeTool("nw", "nwse-resize"))(),
//         new (createResizeTool("n", "ns-resize"))(),
//         new (createResizeTool("ne", "nesw-resize"))(),
//         new (createResizeTool("e", "ew-resize"))(),
//         new (createResizeTool("se", "nwse-resize"))(),
//         new (createResizeTool("s", "ns-resize"))(),
//         new (createResizeTool("sw", "nesw-resize"))(),
//         new (createResizeTool("w", "ew-resize"))(),
//       ],
//     });

//     shape.findView(paperInstanceRef.current).addTools(ResizeToolsView);
//   };

//   const createResizeTool = (direction: string, cursor: string) =>
//     joint.elementTools.Control.extend({
//       children: [
//         {
//           tagName: "circle",
//           selector: "handle", // ✅ REQUIRED
//           attributes: {
//             r: 8,
//             fill: "transparent",
//             stroke: "transparent",
//             "stroke-width": 2,
//             cursor,
//           },
//         },
//       ],

//       getPosition(view) {
//         const { width, height } = view.model.size();

//         const positions: Record<string, any> = {
//           nw: { x: 0, y: 0 },
//           n: { x: width / 2, y: 0 },
//           ne: { x: width, y: 0 },
//           e: { x: width, y: height / 2 },
//           se: { x: width, y: height },
//           s: { x: width / 2, y: height },
//           sw: { x: 0, y: height },
//           w: { x: 0, y: height / 2 },
//         };

//         return positions[direction];
//       },

//       setPosition(view, coords) {
//         const model = view.model;
//         const minSize = 40;

//         let { x, y } = model.position();
//         let { width, height } = model.size();

//         switch (direction) {
//           case "e":
//             width = Math.max(coords.x, minSize);
//             break;

//           case "s":
//             height = Math.max(coords.y, minSize);
//             break;

//           case "se":
//             width = Math.max(coords.x, minSize);
//             height = Math.max(coords.y, minSize);
//             break;

//           case "w": {
//             const dx = coords.x;
//             const newWidth = Math.max(width - dx, minSize);
//             x += width - newWidth;
//             width = newWidth;
//             break;
//           }

//           case "n": {
//             const dy = coords.y;
//             const newHeight = Math.max(height - dy, minSize);
//             y += height - newHeight;
//             height = newHeight;
//             break;
//           }

//           case "nw": {
//             const dx = coords.x;
//             const dy = coords.y;

//             const newWidth = Math.max(width - dx, minSize);
//             const newHeight = Math.max(height - dy, minSize);

//             x += width - newWidth;
//             y += height - newHeight;

//             width = newWidth;
//             height = newHeight;
//             break;
//           }

//           case "ne": {
//             const dy = coords.y;
//             const newHeight = Math.max(height - dy, minSize);
//             y += height - newHeight;

//             width = Math.max(coords.x, minSize);
//             height = newHeight;
//             break;
//           }

//           case "sw": {
//             const dx = coords.x;
//             const newWidth = Math.max(width - dx, minSize);
//             x += width - newWidth;

//             width = newWidth;
//             height = Math.max(coords.y, minSize);
//             break;
//           }
//         }

//         model.position(x, y);
//         model.resize(width, height);
//       },
//     });

//   // Drag Start from Sidebar
//   const onDragStart = (e: React.DragEvent, type: string) => {
//     e.dataTransfer.setData("shape/type", type);
//   };

//   return (
//     <div className="h-screen w-screen overflow-hidden bg-linear-to-br from-slate-50 to-slate-100">
//       {/* Sidebar */}
//       <div className="absolute top-1/2 left-6 -translate-y-1/2 bg-white shadow-lg border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 z-50">
//         <button
//           className="p-3 rounded-lg hover:bg-blue-50 transition-colors group flex-0"
//           draggable
//           onDragStart={(e) => onDragStart(e, "rectangle")}
//           title="Rectangle"
//         >
//           <SquareIcon size={20} className="text-blue-600" />
//         </button>

//         <button
//           className="p-3 rounded-lg hover:bg-green-50 transition-colors group"
//           draggable
//           onDragStart={(e) => onDragStart(e, "circle")}
//           title="Circle"
//         >
//           <CircleIcon size={20} className="text-green-600" />
//         </button>

//         <button
//           className="p-3 rounded-lg hover:bg-red-50 transition-colors group"
//           draggable
//           onDragStart={(e) => onDragStart(e, "diamond")}
//           title="Diamond"
//         >
//           <DiamondIcon size={20} className="text-red-600" />
//         </button>

//         <button
//           className="p-3 rounded-lg hover:bg-purple-50 transition-colors group"
//           draggable
//           onDragStart={(e) => onDragStart(e, "triangle")}
//           title="Triangle"
//         >
//           <TriangleIcon size={20} className="text-purple-600" />
//         </button>
//       </div>

//       {/* Paper */}
//       <div
//         ref={paperRef}
//         style={{
//           width: "100vw",
//           height: "100vh",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       ></div>
//       {editing && (
//         <input
//           ref={inputRef}
//           value={editing.value}
//           onChange={(e) => setEditing({ ...editing, value: e.target.value })}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") saveLabel();
//             if (e.key === "Escape") cancelLabel();
//           }}
//           style={{
//             position: "fixed",
//             left: editing.x,
//             top: editing.y,
//             width: editing.width,
//             height: editing.height,
//             fontSize: 13,
//             fontFamily: "Inter, sans-serif",
//             textAlign: "center",
//             border: "1px solid #3b82f6",
//             borderRadius: 6,
//             padding: "2px 6px",
//             zIndex: 1000,
//             outline: "none",
//           }}
//         />
//       )}
//     </div>
//   );
// }

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

  const [editing, setEditing] = React.useState<{
    view: joint.dia.ElementView | null;
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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
      interactive: (cellView, eventName) => {
        if (cellView.model.isLink()) return true;
        const target = (eventName as any)?.target as HTMLElement;
        const isPort = target?.closest("[magnet]") != null;
        if (isPort) return { elementMove: false, addLinkFromMagnet: true };
        return { elementMove: true };
      },
      // interactive: (cellView, evt) => {
      //   if (cellView.model.isLink()) return true;

      //   return {
      //     elementMove: true,
      //     addLinkFromMagnet: (evt as any).type === "pointerdown" ? false : true,
      //   };
      // },
      drawGrid: true,
      gridSize: 10,
    });
    paperInstanceRef.current = paper;

    paperInstanceRef.current.on("element:pointerdown", (view) => {
      selectElement(view);
    });

    paperInstanceRef.current.on("blank:pointerdown", () => {
      clearSelection();
    });

    paperInstanceRef.current.on("link:connect", (linkView) => {
      if (!linkView.model.getTargetCell()) {
        linkView.model.remove();
      }
    });

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

    // graph.on("change:size", (element) => {
    //   const shapeType = shapeTypesRef.current.get(element.id);
    //   if (shapeType) {
    //     updatePortPositions(element, shapeType);
    //   }
    // });

    // Drag and drop
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", handleDrop);

    const handleResize = () => {
      paper.setDimensions(el.clientWidth, el.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  //selection helper

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
  // function selectElement(view: joint.dia.ElementView) {
  //   if (selectionRef.current) {
  //     const prevView = paperInstanceRef.current.findViewByModel(
  //       selectionRef.current
  //     );
  //     if (prevView) {
  //       unhighlightSelection(prevView);
  //     }
  //   }

  //   selectionRef.current = view.model;
  //   highlightSelection(view);
  // }

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
    addLinkTool(view);
  }

  // function clearSelection() {
  //   if (selectionRef.current) {
  //     const view = paperInstanceRef.current.findViewByModel(
  //       selectionRef.current
  //     );
  //     if (view) {
  //       unhighlightSelection(view);
  //     }
  //   }

  //   selectionRef.current = null;
  // }

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
              // magnet: true,
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
              magnet: "passive",
              // magnet: true,
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
              magnet: "passive",
              // magnet: true,
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
              magnet: "passive",
              // magnet: true,
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
            },
          },
        });
        break;
    }

    graphRef.current.addCell(shape);
    shapeTypesRef.current.set(shape.id, type);
    // addOutPorts(shape, type);

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

  const addOutPorts = (shape: joint.dia.Element, type: string) => {
    const { width, height } = shape.size();
    const portPositions = getPortPositions(type, width, height);

    // Create ports based on the number of sides
    const ports = portPositions.map((_, i) => ({
      id: `out-${i}`,
      group: "out",
    }));

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

  const getNearestPort = (
    shape: joint.dia.Element,
    cursorX: number,
    cursorY: number
  ): string | null => {
    const ports = shape.getPorts();
    const shapePos = shape.position();
    let nearestPortId = null;
    let minDistance = Infinity;

    ports.forEach((port: any) => {
      const portX = shapePos.x + (port.x || 0);
      const portY = shapePos.y + (port.y || 0);
      const distance = Math.sqrt(
        Math.pow(cursorX - portX, 2) + Math.pow(cursorY - portY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPortId = port.id;
      }
    });

    return nearestPortId;
  };

  //Tool helper

  function addLinkTool(view: joint.dia.ElementView) {
    const toolsView = new joint.dia.ToolsView({
      tools: [createLinkTool()],
    });

    view.addTools(toolsView);
  }

  function removeTools(view: joint.dia.ElementView) {
    view.removeTools();
  }

  //Tools

  const createLinkTool = () =>
    new joint.elementTools.Button({
      x: "100%",
      y: "50%",
      offset: { x: 10, y: -10 },

      markup: [
        {
          tagName: "circle",
          selector: "button",
          attributes: {
            r: 12,
            fill: "#2563eb",
            cursor: "pointer",
          },
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

      action: function (evt, view) {
        evt.stopPropagation();

        const paper = view.paper;
        const graph = view.model.graph;

        const link = new joint.shapes.standard.Link({
          source: {
            id: view.model.id,
            anchor: { name: "center" },
          },
          target: {
            x: evt.clientX,
            y: evt.clientY,
          },
          attrs: {
            line: {
              stroke: "#374151",
              strokeWidth: 2,
              targetMarker: { type: "classic" },
            },
          },
        });

        graph.addCell(link);

        const linkView = link.findView(
          paperInstanceRef.current
        ) as joint.dia.LinkView;

        if (linkView) {
          linkView.startArrowheadMove("target");
        }
      },
    });

  const createResizeTool = (direction: string, cursor: string) =>
    joint.elementTools.Control.extend({
      children: [
        {
          tagName: "circle",
          selector: "handle", // ✅ REQUIRED
          attributes: {
            r: 8,
            fill: "transparent",
            stroke: "transparent",
            "stroke-width": 2,
            cursor,
          },
        },
      ],

      getPosition(view) {
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

      setPosition(view, coords) {
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
    </div>
  );
}

// ===================================
