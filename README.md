# Building a Drag-and-Drop Diagram Editor in React with JointJS

A step-by-step tutorial to create a flowchart/diagram editor using JointJS v4 in React, with drag-and-drop shapes, ports, links, and editable labels.

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Installation](#setup-and-installation)
3. [Understanding Graph and Paper](#understanding-graph-and-paper)
4. [Adding Shapes](#adding-shapes)
5. [Drag-and-Drop Shapes from Sidebar](#drag-and-drop-shapes-from-sidebar)
6. [Adding Ports for Connections](#adding-ports-for-connections)
7. [Creating and Editing Links](#creating-and-editing-links)
8. [Full Project Code](#full-project-code)
9. [Demo & Features](#demo--features)
10. [Next Steps & Resources](#next-steps--resources)

## 1️⃣ Introduction

JointJS is a powerful JavaScript library for creating interactive diagrams.

This tutorial will help you build:

- Drag-and-drop shapes from a sidebar
- Connect shapes with links using ports
- Edit element and link labels
- Responsive, visually appealing paper

## 2️⃣ Setup and Installation

Install dependencies:

```bash
npm install @joint/core lucide-react
```

Create a new Next.js page (`app/page.tsx` or `pages/index.tsx`) for your diagram editor.

## 3️⃣ Understanding Graph and Paper

**Graph**: Stores all diagram data (elements and links).  
**Paper**: Renders the graph on the DOM and handles interactions.

Example:

```javascript
const graph = new joint.dia.Graph();

const paper = new joint.dia.Paper({
  el: paperRef.current, // DOM element
  model: graph, // Graph instance
  width: 1000,
  height: 600,
  drawGrid: true,
});
```

Interactive options:

```javascript
interactive: (cellView, eventName) => {
  if (cellView.model.isLink()) return true;
  const target = (eventName as any)?.target as HTMLElement;
  const isPort = target?.closest("[magnet]") != null;
  if (isPort) return { elementMove: false, addLinkFromMagnet: true };
  return { elementMove: true };
}
```

## 4️⃣ Adding Shapes

Shapes are JointJS elements:

```javascript
const rect = new joint.shapes.standard.Rectangle({
  position: { x: 100, y: 100 },
  size: { width: 120, height: 60 },
  attrs: {
    body: { fill: "#2563eb", stroke: "#1e40af" },
    label: { text: "Rectangle", fill: "white" },
  },
});

graph.addCell(rect);
```

Other shapes:

- **Circle**: `new joint.shapes.standard.Circle({...})`
- **Diamond/Triangle**: `new joint.shapes.standard.Polygon({...})`

Shapes can have `refPoints` for polygons and drop shadows for style.

## 5️⃣ Drag-and-Drop Shapes from Sidebar

### Sidebar Button:

```jsx
<button draggable onDragStart={(e) => onDragStart(e, "rectangle")}>
  Rectangle
</button>
```

### Drag Start:

```javascript
const onDragStart = (e: React.DragEvent, type: string) => {
  e.dataTransfer.setData("shape/type", type);
};
```

### Drop on Paper:

```javascript
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const type = e.dataTransfer?.getData("shape/type");
  const local = paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
  createShape(type, local.x - 50, local.y - 20);
};
```

## 6️⃣ Adding Ports for Connections

Ports define linkable points on shapes:

```javascript
element.addPorts([
  {
    group: "top",
    attrs: { circle: { r: 6, fill: "#fff", stroke: "#000", magnet: true } },
  },
  {
    group: "bottom",
    attrs: { circle: { r: 6, fill: "#fff", stroke: "#000", magnet: true } },
  },
]);

element.prop("ports/groups", {
  top: { position: { name: "top" } },
  bottom: { position: { name: "bottom" } },
});
```

- `magnet: true` allows connecting links to the port.
- Ports can be on **top**, **bottom**, **left**, or **right**.

## 7️⃣ Creating and Editing Links

### Default link style:

```javascript
defaultLink: () =>
  new joint.shapes.standard.Link({
    attrs: { line: { stroke: "#6b7280", strokeWidth: 2 } },
    labels: [
      {
        attrs: { text: { text: "connect", fill: "#374151", fontSize: 12 } },
        position: 0.5,
      },
    ],
  });
```

### Editing link label on double-click:

```javascript
paper.on("link:pointerdblclick", (linkView) => {
  const link = linkView.model;
  const currentText = link.label(0)?.attrs?.text?.text || "";
  const newText = prompt("Edit link label:", currentText);
  if (newText !== null) {
    if (link.labels().length === 0) {
      link.appendLabel({ attrs: { text: { text: newText } }, position: 0.5 });
    } else {
      link.label(0, { attrs: { text: { text: newText } } });
    }
  }
});
```

**Tip**: In JointJS v4, link label path is `attrs.text.text`, not `attrs.label.text`.

## 8️⃣ Full Project Code

```tsx
"use client";
import React, { useEffect, useRef } from "react";
import * as joint from "@joint/core";
import { SquareIcon, CircleIcon, DiamondIcon, TriangleIcon } from "lucide-react";

export default function Home() {
  const paperRef = useRef(null);
  const graphRef = useRef(null);
  const paperInstanceRef = useRef(null);

  const colors = {
    rectangle: { fill: "#2563eb", stroke: "#1e40af" },
    circle: { fill: "#059669", stroke: "#065f46" },
    diamond: { fill: "#dc2626", stroke: "#7f1d1d" },
    triangle: { fill: "#9333ea", stroke: "#581c87" },
  };

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
      interactive: true,
      defaultLink: () => new joint.shapes.standard.Link({
        attrs: { line: { stroke: "#6b7280", strokeWidth: 2 } },
        labels: [{ attrs: { text: { text: "connect", fill: "#374151", fontSize: 12 } }, position: 0.5 }],
      }),
      snapLinks: { radius: 20 },
      linkPinning: false,
      markAvailable: true,
    });
    paperInstanceRef.current = paper;

    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", handleDrop);
  }, []);

  const createShape = (type: string, x = 100, y = 100) => {
    if (!graphRef.current) return;
    let shape: any;
    switch (type) {
      case "rectangle": shape = new joint.shapes.standard.Rectangle({ position: { x, y }, size: { width: 140, height: 70 }, attrs: { body: { fill: colors.rectangle.fill, stroke: colors.rectangle.stroke }, label: { text: "Rectangle", fill: "white" } } }); break;
      case "circle": shape = new joint.shapes.standard.Circle({ position: { x, y }, size: { width: 90, height: 90 }, attrs: { body: { fill: colors.circle.fill, stroke: colors.circle.stroke }, label: { text: "Circle", fill: "white" } } }); break;
      case "diamond": shape = new joint.shapes.standard.Polygon({ position: { x, y }, size: { width: 100, height: 100 }, attrs: { body: { refPoints: "50,0 100,50 50,100 0,50", fill: colors.diamond.fill, stroke: colors.diamond.stroke }, label: { text: "Diamond", fill: "white" } } }); break;
      case "triangle": shape = new joint.shapes.standard.Polygon({ position: { x, y }, size: { width: 100, height: 100 }, attrs: { body: { refPoints: "50,0 100,100 0,100", fill: colors.triangle.fill, stroke: colors.triangle.stroke }, label: { text: "Triangle", fill: "white" } } }); break;
    }
    graphRef.current.addCell(shape);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer?.getData("shape/type");
    const paper = paperInstanceRef.current;
    if (!type || !paper) return;
    const local: any = paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
    createShape(type, local.x - 50, local.y - 20);
  };

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("shape/type", type);
  };

  return (


        <button draggable onDragStart={(e) => onDragStart(e, "rectangle")}>
        <button draggable onDragStart={(e) => onDragStart(e, "circle")}>
        <button draggable onDragStart={(e) => onDragStart(e, "diamond")}>
        <button draggable onDragStart={(e) => onDragStart(e, "triangle")}>



  );
}
```

## 9️⃣ Demo & Features

- ✅ Drag shapes from the sidebar to paper
- ✅ Connect shapes with links using ports
- ✅ Double-click links to edit labels
- ✅ Color-coded shapes with shadows for style
- ✅ Responsive canvas
