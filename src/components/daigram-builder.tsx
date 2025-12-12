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
