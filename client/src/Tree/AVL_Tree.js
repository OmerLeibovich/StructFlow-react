import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { TREE_API } from "../api";

const NODE_RADIUS = 20;
const VERTICAL_SPACING = 80;

const AVLTreeVisualizer = () => {
  const [treeData, setTreeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [HighlightsNodes, setHighlightsNodes] = useState(null);
  const [bfsMode, setBfsMode] = useState(false);
  const [dfsMode,setDfsMode] = useState(false);
  const [resetMode,setResetMode] = useState("Reset");
  const inputRef = useRef(null);




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
    if (bfsMode || dfsMode){
      alert("You cant insert when bfs or dfs activate");
      return;
    }
    await TREE_API.insertNode(num);
    setInputValue("");      
    fetchTree();  
    inputRef.current?.focus();

  };

  const handleDelete = async () => {
    const num = parseInt(inputValue);
    if (isNaN(num)) {
      alert("Please enter a valid number");
      return;
    }
    if (bfsMode || dfsMode){
      alert("You cant delete when bfs or dfs activate");
      return;
    }
    await TREE_API.deleteNode(num);
    setInputValue("");
    fetchTree();
    inputRef.current?.focus();

  };
  const handleBFS = async () => {
    if (dfsMode){
      alert("You cant use bfs when dfs activate");
      return;
    }
    const res = await TREE_API.startBFS();
    setResetMode("ResetBFS");
    if (res.highlighted_nodes) {
      setHighlightsNodes(res.highlighted_nodes);
      setBfsMode(true);
    }
    
  };
  const handleDFS = async () => {
    if (bfsMode){
      alert("You cant use dfs when bfs activate");
      return;
    }
    const res = await TREE_API.startDFS();
    setResetMode("ResetDFS");
    if (res.DFS_Targets) {
      setHighlightsNodes(res.DFS_Targets);
      setDfsMode(true);
    }
    
  };
  const handleReset = async () => {
    if (resetMode === "Reset") {
      await TREE_API.resetTree();
      setTreeData(null);
    } else if (resetMode === "ResetBFS") {
      await TREE_API.resetBFS();
      setBfsMode(false);
    } else if (resetMode === "ResetDFS") {
      await TREE_API.resetDFS();
      setDfsMode(false);
    }
    fetchTree();
    setResetMode("Reset");
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
        <circle cx={x} cy={y} r={NODE_RADIUS} 
            fill={
              (bfsMode || dfsMode) &&
              HighlightsNodes &&
              HighlightsNodes.includes(node.name)
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
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
          placeholder="Insert number"
        />
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleBFS}>Run BFS</button>
        <button onClick={handleDFS}>Run DFS</button>
      </div>

      <h3>Tree Nodes: {treeData && treeData.name ? buildArrayTree(treeData).join(", ") : "No data"}</h3>

      <svg className="svg">
        <rect className="svg-bg" />
        {treeData && treeData.name && renderTree(treeData, 500, 80)}
      </svg>
      <div className="resetButtonBackground">
            <button onClick = {handleReset} className="resetButton"
            >
        {resetMode}
        </button>
        </div>
    </div>
  );
};

export default AVLTreeVisualizer;
