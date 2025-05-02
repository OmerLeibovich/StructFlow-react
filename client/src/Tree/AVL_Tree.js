import React, { use, useEffect, useState } from "react";
import "../App.css";
import { TREE_API } from "../api";

const NODE_RADIUS = 20;
const VERTICAL_SPACING = 80;

const AVLTreeVisualizer = () => {
  const [treeData, setTreeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [HighlightsNodes, setHighlightsNodes] = useState(null);
  const [bfsMode, setBfsMode] = useState(false);


  const fetchTree = async () => {
    const res = await TREE_API.getTree();
    setTreeData(res);
  };

  const handleInsert = async () => {
    const num = parseInt(inputValue);
    if (isNaN(num)) {
      alert("Please enter a valid number");
      return;
    }
    await TREE_API.insertNode(num);
    setInputValue("");      
    fetchTree();            
  };

  const handleDelete = async () => {
    const num = parseInt(inputValue);
    if (isNaN(num)) {
      alert("Please enter a valid number");
      return;
    }
    await TREE_API.deleteNode(num);
    setInputValue("");
    fetchTree();
  };
  const handleBFS = async () => {
    const res = await TREE_API.startBFS();
    if (res.highlighted_nodes) {
      setHighlightsNodes(res.highlighted_nodes);
      setBfsMode(true);
    }
    
  };
  const handleResetBFS = () => {
    setBfsMode(false);
    setHighlightsNodes(null);
  };
  
  

  const buildArrayTree = (node, index = 0, array = []) => {
    while (array.length <= index) {
      array.push("None");
    }
  
    array[index] = node ? node.name : "None";
  
    if (node) {
      buildArrayTree(node.left, 2 * index + 1, array);
      buildArrayTree(node.right, 2 * index + 2, array);
    }
  
    if (index === 0) {
      let lastIndexWithValue = -1;
      for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] !== "None") {
          lastIndexWithValue = i;
          break;
        }
      }
      array.length = lastIndexWithValue + 1;
    }
  
    return array;
  };

  
  

  useEffect(() => {
    fetchTree();
  }, []);

  const renderTree = (node, x, y, level = 0, parentPos = null, posIndex = 0) => {
    if (!node) return [];
  
    const horizontalGap = 280;
    const nextY = y + VERTICAL_SPACING;
    const offset = horizontalGap / (level + 4);
  
    const leftX = x - offset * Math.pow(2, 2 - level);  
    const rightX = x + offset * Math.pow(2, 2 - level);
  
    const elements = [];
  
    if (parentPos) {
      const dx = x - parentPos.x;
      const dy = y - parentPos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
  
      const shorteningFactor = 1.2;
      const rawOffset = NODE_RADIUS * shorteningFactor;
      const maxAllowedOffset = length / 2.2;
      const actualOffset = Math.min(rawOffset, maxAllowedOffset);
  
      const offsetX = (dx / length) * actualOffset;
      const offsetY = (dy / length) * actualOffset;
  
      elements.push(
        <line
          key={`line-${parentPos.x}-${x}`}
          x1={parentPos.x + offsetX}
          y1={parentPos.y + offsetY}
          x2={x - offsetX}
          y2={y - offsetY}
          stroke="black"
        />
      );
    }
  
    elements.push(
      <g key={`node-${x}-${y}`}>
        <circle cx={x} cy={y} r={NODE_RADIUS}  fill={
          bfsMode && HighlightsNodes && HighlightsNodes.includes(node.name)
            ? "red"
            : "black"
        }
      />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fontSize="14"
          fill="white"
        >
          {node.name}
        </text>
      </g>
    );
  
    if (node.left) {
      elements.push(...renderTree(node.left, leftX, nextY, level + 1, { x, y }));
    }
    if (node.right) {
      elements.push(...renderTree(node.right, rightX, nextY, level + 1, { x, y }));
    }
  
    return elements;
  };

  return (
    <div className="App">
      <h2>AVL Tree Visualizer (SVG)</h2>

      <div className="header">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
          placeholder="Insert number"
        />
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleBFS}>Run BFS</button>

      </div>

      <h3>Tree Nodes: {treeData ? buildArrayTree(treeData).join(", ") : "No data"}</h3>




      <svg className="svg">
        <rect className="svg-bg" />
        {treeData && renderTree(treeData, 500, 80)}
      </svg>
    </div>
  );
};

export default AVLTreeVisualizer;
