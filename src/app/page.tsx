// "use client";
// import React, { useEffect, useRef } from "react";
// import * as joint from "@joint/core";
// import {
//   SquareIcon,
//   CircleIcon,
//   DiamondIcon,
//   TriangleIcon,
// } from "lucide-react";

// export default function Home() {
//   const paperRef = useRef<HTMLDivElement | null>(null);
//   const graphRef = useRef<any>(null);
//   const paperInstanceRef = useRef<any>(null);

//   const [dragType, setDragType] = React.useState<string | null>(null);
//   const [linkSource, setLinkSource] = React.useState<any>(null);

//   // ------------------------
//   // Initialize Paper & Graph
//   // ------------------------
//   useEffect(() => {
//     const el = paperRef.current;
//     if (!el) return;

//     const graph = new joint.dia.Graph();
//     graphRef.current = graph;

//     // const paper = new joint.dia.Paper({
//     //   el,
//     //   model: graph,
//     //   width: el.clientWidth,
//     //   height: el.clientHeight,
//     //   gridSize: 10,
//     //   drawGrid: true,
//     //   interactive: true,
//     // });
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
//       // defaultLink: () => new joint.shapes.standard.Link(),
//       // defaultLink: () =>
//       //   new joint.shapes.standard.Link({
//       //     labels: [
//       //       {
//       //         attrs: { label: { text: "hellooo", fill: "#000", fontSize: 14 } },
//       //         position: 0.5,
//       //       },
//       //     ],
//       //   }),
//       defaultLink: () =>
//         new joint.shapes.standard.Link({
//           labels: [
//             {
//               attrs: { text: { text: "Hello", fill: "red", fontSize: 14 } },
//               position: 0.5,
//             },
//           ],
//         }),
//       snapLinks: { radius: 20 },
//       linkPinning: false,
//       markAvailable: true,
//     });
//     paperInstanceRef.current = paper;

//     paper.on("element:mouseenter", (elementView: joint.dia.ElementView) => {
//       elementView.hideTools();
//     });

//     paper.on("element:mouseleave", (elementView: joint.dia.ElementView) => {
//       elementView.showTools();
//     });

//     // Double-click to edit label
//     paperInstanceRef.current.on("element:pointerdblclick", (cellView: any) => {
//       const currentText = cellView.model.attr("label/text");
//       const newText = prompt("Edit label:", currentText);
//       if (newText !== null) {
//         cellView.model.attr("label/text", newText);
//       }
//     });

//     // paperInstanceRef.current.on("link:pointerdblclick", (linkView: any) => {
//     //   const link = linkView.model as joint.dia.Link;

//     //   const currentText = link.label(0)?.attrs?.label?.text || "";

//     //   const newText = prompt("Edit link label:", currentText);
//     //   if (newText !== null) {
//     //     if (link.labels().length === 0) {
//     //       // If no label exists, append a new one
//     //       link.appendLabel({
//     //         attrs: {
//     //           label: {
//     //             text: newText,
//     //             fill: "#000",
//     //             fontSize: 14,
//     //           },
//     //         },
//     //         position: 0.5, // middle of the link
//     //       });
//     //     } else {
//     //       // If label exists, update the text
//     //       link.label(0, {
//     //         attrs: {
//     //           label: {
//     //             text: newText,
//     //             fill: "#000",
//     //             fontSize: 14,
//     //           },
//     //         },
//     //       });
//     //     }
//     //   }
//     // });

//     paperInstanceRef.current.on("link:pointerdblclick", (linkView: any) => {
//       const link = linkView.model as joint.dia.Link;

//       const currentText = link.label(0)?.attrs?.text?.text || "";

//       const newText = prompt("Edit link label:", currentText);
//       if (newText !== null) {
//         if (link.labels().length === 0) {
//           // Append new label if it doesn't exist
//           link.appendLabel({
//             attrs: {
//               text: { text: newText, fill: "red", fontSize: 14 },
//             },
//             position: 0.5, // middle of the link
//           });
//         } else {
//           // Update existing label
//           link.label(0, {
//             attrs: {
//               text: { text: newText, fill: "red", fontSize: 14 },
//             },
//           });
//         }
//       }
//     });

//     // Drag and drop
//     el.addEventListener("dragover", (e) => e.preventDefault());
//     el.addEventListener("drop", handleDrop);

//     // Responsive paper
//     const handleResize = () => {
//       paper.setDimensions(el.clientWidth, el.clientHeight);
//     };
//     window.addEventListener("resize", handleResize);

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ------------------------
//   // Handle Drop Event
//   // ------------------------
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

//   const addPorts = (shape: joint.dia.Element) => {
//     shape.addPorts([
//       {
//         group: "top",
//         attrs: { circle: { r: 5, fill: "#fff", stroke: "#000", magnet: true } },
//       },
//       {
//         group: "bottom",
//         attrs: { circle: { r: 5, fill: "#fff", stroke: "#000", magnet: true } },
//       },
//       {
//         group: "left",
//         attrs: { circle: { r: 5, fill: "#fff", stroke: "#000", magnet: true } },
//       },
//       {
//         group: "right",
//         attrs: { circle: { r: 5, fill: "#fff", stroke: "#000", magnet: true } },
//       },
//     ]);

//     shape.prop("ports/groups", {
//       top: { position: { name: "top" } },
//       bottom: { position: { name: "bottom" } },
//       left: { position: { name: "left" } },
//       right: { position: { name: "right" } },
//     });
//   };

//   // ------------------------
//   // Create Shape Function
//   // ------------------------
//   const createShape = (type: string, x = 100, y = 100) => {
//     if (!graphRef.current) return;

//     let shape: any;

//     switch (type) {
//       case "rectangle":
//         shape = new joint.shapes.standard.Rectangle({
//           position: { x, y },
//           size: { width: 120, height: 60 },
//           attrs: {
//             body: { fill: "#4f46e5", stroke: "#312e81" },
//             label: { text: "Rectangle", fill: "white" },
//           },
//         });
//         break;

//       case "circle":
//         shape = new joint.shapes.standard.Circle({
//           position: { x, y },
//           size: { width: 80, height: 80 },
//           attrs: {
//             body: { fill: "#16a34a", stroke: "#14532d" },
//             label: { text: "Circle", fill: "white" },
//           },
//         });
//         break;

//       case "diamond":
//         shape = new joint.shapes.standard.Polygon({
//           position: { x, y },
//           size: { width: 100, height: 100 },
//           attrs: {
//             body: {
//               refPoints: "50,0 100,50 50,100 0,50",
//               fill: "#e11d48",
//               stroke: "#881337",
//             },
//             label: { text: "Diamond", fill: "white" },
//           },
//         });
//         break;

//       case "triangle":
//         shape = new joint.shapes.standard.Polygon({
//           position: { x, y },
//           size: { width: 100, height: 100 },
//           attrs: {
//             body: {
//               refPoints: "50,0 100,100 0,100",
//               fill: "#f59e0b",
//               stroke: "#b45309",
//             },
//             label: { text: "Triangle", fill: "white" },
//           },
//         });
//         break;
//     }

//     graphRef.current.addCell(shape);

//     addPorts(shape);
//   };

//   // ------------------------
//   // Drag Start from Sidebar
//   // ------------------------
//   const onDragStart = (e: React.DragEvent, type: string) => {
//     e.dataTransfer.setData("shape/type", type);
//   };

//   return (
//     <div className="h-screen w-screen overflow-hidden">
//       {/* Sidebar */}
//       <div className="absolute top-1/2 left-6 -translate-y-1/2 bg-white shadow-md border p-3 rounded-xl flex flex-col gap-3 z-50">
//         <button
//           className="p-2 rounded-md hover:bg-gray-100"
//           draggable
//           onDragStart={(e) => onDragStart(e, "rectangle")}
//         >
//           <SquareIcon size={22} />
//         </button>

//         <button
//           className="p-2 rounded-md hover:bg-gray-100"
//           draggable
//           onDragStart={(e) => onDragStart(e, "circle")}
//         >
//           <CircleIcon size={22} />
//         </button>

//         <button
//           className="p-2 rounded-md hover:bg-gray-100"
//           draggable
//           onDragStart={(e) => onDragStart(e, "diamond")}
//         >
//           <DiamondIcon size={22} />
//         </button>

//         <button
//           className="p-2 rounded-md hover:bg-gray-100"
//           draggable
//           onDragStart={(e) => onDragStart(e, "triangle")}
//         >
//           <TriangleIcon size={22} />
//         </button>
//       </div>

//       {/* Paper */}
//       <div
//         ref={paperRef}
//         style={{
//           width: "100vw",
//           height: "100vh",
//           border: "1px solid #aaa",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       ></div>
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

export default function Home() {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);
  const paperInstanceRef = useRef<any>(null);

  const [dragType, setDragType] = React.useState<string | null>(null);
  const [linkSource, setLinkSource] = React.useState<any>(null);

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
    });
    paperInstanceRef.current = paper;

    paper.on("element:mouseenter", (elementView: joint.dia.ElementView) => {
      elementView.hideTools();
    });

    paper.on("element:mouseleave", (elementView: joint.dia.ElementView) => {
      elementView.showTools();
    });

    // Double-click to edit label
    paperInstanceRef.current.on("element:pointerdblclick", (cellView: any) => {
      const currentText = cellView.model.attr("label/text");
      const newText = prompt("Edit label:", currentText);
      if (newText !== null) {
        cellView.model.attr("label/text", newText);
      }
    });

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
        shape = new joint.shapes.standard.Circle({
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
  };

  // Drag Start from Sidebar
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("shape/type", type);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 bg-white shadow-lg border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 z-50">
        <p className="text-xs font-semibold text-slate-600 px-2 mb-1">Shapes</p>

        <button
          className="p-3 rounded-lg hover:bg-blue-50 transition-colors group"
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
