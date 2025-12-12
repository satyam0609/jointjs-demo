"use client";
// import React, { useEffect, useRef } from "react";
// import * as joint from "@joint/core";

// export default function DiagramBuilder() {
//   const paperRef = useRef(null);

//   useEffect(() => {
//     const el: any = paperRef.current;

//     const graph = new joint.dia.Graph();

//     const paper = new joint.dia.Paper({
//       el,
//       model: graph,
//       width: el.clientWidth,
//       height: el.clientHeight,
//       gridSize: 10,
//       drawGrid: true,
//     });

//     // START NODE
//     const start = new joint.shapes.standard.Rectangle();
//     start.position(100, 250);
//     start.resize(120, 50);
//     start.attr({
//       body: { fill: "#3498db" },
//       label: { text: "Start", fill: "white" },
//     });
//     start.addTo(graph);

//     // END NODE
//     const end = new joint.shapes.standard.Circle();
//     end.position(400, 240);
//     end.resize(80, 80);
//     end.attr({
//       body: { fill: "#2ecc71" },
//       label: { text: "End", fill: "white" },
//     });
//     end.addTo(graph);

//     // LINK
//     const link = new joint.shapes.standard.Link();
//     link.source(start);
//     link.target(end);
//     link.addTo(graph);

//     // OPTIONAL: Auto resize on window resize
//     const handleResize = () => {
//       paper.setDimensions(el.clientWidth, el.clientHeight);
//     };
//     window.addEventListener("resize", handleResize);

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div
//       ref={paperRef}
//       style={{
//         width: "100vw",
//         height: "100vh",
//         border: "1px solid #aaa",
//       }}
//     />
//   );
// }

// Day - 2

import React, { useEffect, useRef } from "react";
import * as joint from "@joint/core";

export default function DiagramDay2() {
  const paperRef = useRef(null);

  useEffect(() => {
    const el = paperRef.current;

    // Graph
    const graph = new joint.dia.Graph();

    // Paper
    const paper = new joint.dia.Paper({
      el,
      model: graph,
      width: el.clientWidth,
      height: el.clientHeight,
      gridSize: 10,
      drawGrid: true,
    });

    // ---------------------------------------------------------
    // 1️⃣ PROCESS NODE (Rounded Rectangle)
    // ---------------------------------------------------------

    const ProcessNode = joint.shapes.standard.Rectangle.define(
      "custom.ProcessNode",
      {
        attrs: {
          body: {
            fill: "#4a90e2",
            stroke: "#003f7f",
            strokeWidth: 2,
            rx: 10, // rounded corners
          },
          label: {
            text: "Process",
            fill: "white",
            fontSize: 14,
          },
        },
      }
    );

    const process = new ProcessNode();
    process.position(100, 100);
    process.resize(140, 60);
    process.addTo(graph);

    // ---------------------------------------------------------
    // 2️⃣ DECISION NODE (Diamond shape)
    // ---------------------------------------------------------

    const DecisionNode = joint.shapes.standard.Polygon.define(
      "custom.DecisionNode",
      {
        attrs: {
          body: {
            refPoints: "50,0 100,50 50,100 0,50", // diamond shape
            fill: "#f39c12",
            stroke: "#7a4c00",
            strokeWidth: 2,
          },
          label: {
            text: "Decision",
            fill: "white",
            fontSize: 14,
          },
        },
      }
    );

    const decision = new DecisionNode();
    decision.position(350, 90);
    decision.resize(120, 120);
    decision.addTo(graph);

    // ---------------------------------------------------------
    // 3️⃣ TRIGGER NODE (Circle)
    // ---------------------------------------------------------

    const TriggerNode = joint.shapes.standard.Circle.define(
      "custom.TriggerNode",
      {
        attrs: {
          body: {
            fill: "#e74c3c",
            stroke: "#7a2318",
            strokeWidth: 2,
          },
          label: {
            text: "Trigger",
            fill: "white",
            fontWeight: "bold",
          },
        },
      }
    );

    const trigger = new TriggerNode();
    trigger.position(100, 300);
    trigger.resize(80, 80);
    trigger.addTo(graph);

    // ---------------------------------------------------------
    // 4️⃣ ACTION NODE (Rectangle with blue)
    // ---------------------------------------------------------

    const ActionNode = joint.shapes.standard.Rectangle.define(
      "custom.ActionNode",
      {
        attrs: {
          body: {
            fill: "#2ecc71",
            stroke: "#145c30",
            strokeWidth: 2,
            rx: 6,
          },
          label: {
            text: "Action",
            fill: "white",
            fontWeight: "bold",
            fontSize: 14,
          },
        },
      }
    );

    const action = new ActionNode();
    action.position(350, 300);
    action.resize(150, 60);
    action.addTo(graph);

    // ---------------------------------------------------------
    // 5️⃣ CONDITION NODE (Diamond blue)
    // ---------------------------------------------------------

    const ConditionNode = joint.shapes.standard.Polygon.define(
      "custom.ConditionNode",
      {
        attrs: {
          body: {
            refPoints: "50,0 100,50 50,100 0,50",
            fill: "#8e44ad",
            stroke: "#4a2261",
            strokeWidth: 2,
          },
          label: {
            text: "Condition",
            fill: "white",
            fontSize: 14,
          },
        },
      }
    );

    const condition = new ConditionNode();
    condition.position(600, 280);
    condition.resize(120, 120);
    condition.addTo(graph);

    // ---------------------------------------------------------
    // ✏️  Editable Label for All Nodes
    // ---------------------------------------------------------
    paper.on("element:pointerdblclick", (cellView) => {
      const newText = prompt("Enter new label:");
      if (newText) {
        cellView.model.attr("label/text", newText);
      }
    });
  }, []);

  return (
    <div
      ref={paperRef}
      style={{
        width: "100vw",
        height: "100vh",
        border: "1px solid #aaa",
        overflow: "hidden",
      }}
    />
  );
}
