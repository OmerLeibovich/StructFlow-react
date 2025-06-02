import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { TREE_API } from "../api";


const AVLTreeVisualizer = () => {
  //initialize variables
  const [treeData, setTreeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [HighlightsNodes, setHighlightsNodes] = useState([]);
  const [bfsMode, setBfsMode] = useState(false);
  const [dfsMode,setDfsMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [resetMode,setResetMode] = useState("Reset");
  const inputRef = useRef(null);

  //  useEffect hook to automatically scroll the logs panel to the bottom
  // whenever the logs state changes. This ensures the latest log message
  // is always visible to the user.
  useEffect(() => {
    const scrollBox = document.querySelector(".logScroll");
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
  }, [logs]);
  

const containsValue = (tree, target) => {
  if (!tree) return false;
  if (tree.name === target) return true;
  return containsValue(tree.left, target) || containsValue(tree.right, target);
};

  //Fetch the current AVL tree from the backend.
  const fetchTree = async () => {
    const res = await TREE_API.getTree();
    setTreeData(res);
  };
  //Inserts a new node into the AVL tree.
  //  Prevents insert during BFS/DFS mode.
  const handleInsert = async () => {
  const num = parseInt(inputValue);
  if (isNaN(num)) {
    alert("Please enter a valid number");
    return;
  }
  if (bfsMode || dfsMode) {
    alert("You can't insert when BFS or DFS is active");
    return;
  }
  if (num < 0 || num > 99999) {
    setInputValue(""); 
    alert("Please enter a number between 1 and 100,000");
    return;
  }
   if (containsValue(treeData, num)) {
    alert(`Node ${num} already exists in the tree.`);
    setInputValue(""); 
    inputRef.current?.focus();
    return;
  }

  try {
    await TREE_API.insertNode(num);
    setLogs((prev) => [
      ...prev,
      <span key={prev.length}>
        The number <strong style={{ color: "green" }}>{num}</strong> inserted to the tree.
      </span>
    ]);
    console.log(`The number ${num} inserted to the tree`);
  } catch (error) {
    console.error(`Failed to insert ${num}:`, error);
    alert(`Failed to insert ${num} to the tree.`);
  }
  finally{
    fetchTree();
    setInputValue("");      
    inputRef.current?.focus();
  }
};
  //Deletes a node from the AVL tree.
  // Prevents delete during BFS/DFS mode.
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
     if (!containsValue(treeData, num)) {
      alert(`Node ${num} doesn't exist in the tree.`);
       setInputValue(""); 
    inputRef.current?.focus();
      return;
    }

     try {
    await TREE_API.deleteNode(num);
    setLogs((prev) => [
      ...prev,
      <span key={prev.length}>
        The number <strong style={{ color: "red" }}>{num}</strong> removed from the tree.
      </span>
    ]);
    console.log(`The number ${num} removed from the tree`)
  } catch (error) {
    console.error(`Failed to delete ${num}:`, error);
    alert(`Failed to delete ${num} from the tree.`);
  }
  finally{
    fetchTree();
    setInputValue("");
    inputRef.current?.focus();
  }
  };
  //Runs BFS traversal on the AVL tree.
  // Highlights nodes during traversal.
  const handleBFS = async () => {
  if (dfsMode) {
    alert("You can't use BFS when DFS is active");
    return;
  }

  try {
    const res = await TREE_API.startBFS();
    setResetMode("ResetBFS");

    if (res.highlighted_nodes) {
      const LastSet = HighlightsNodes.length;
      const newVisited = res.highlighted_nodes.slice(LastSet);
      setHighlightsNodes(res.highlighted_nodes);

      if (newVisited.length > 0) {
        const label = newVisited.length === 1 ? "node" : "nodes";

        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            BFS added {label}: <strong style={{ color: "blue" }}>{newVisited.join(", ")}</strong>.
          </span>
        ]);

        console.log(`BFS added ${label}: ${newVisited.join(", ")}`);
      }

      setBfsMode(true);
    }
  } catch (error) {
    console.error("BFS failed:", error);
    alert("BFS traversal failed. Please try again.");
  }
};

  //Runs DFS traversal on the AVL tree.
  // Highlights nodes during traversal.
  const handleDFS = async () => {
  if (bfsMode) {
    alert("You can't use DFS when BFS is active");
    return;
  }

  try {
    const res = await TREE_API.startDFS();
    setResetMode("ResetDFS");

    if (res.DFS_Targets) {
      setHighlightsNodes(res.DFS_Targets);
      const lastNode = res.DFS_Targets[res.DFS_Targets.length - 1];

      setLogs((prev) => [
        ...prev,
        <span key={prev.length}>
          DFS added node: <strong style={{ color: "blue" }}>{lastNode}</strong>
        </span>
      ]);

      console.log(`DFS added node: ${lastNode}`);
      setDfsMode(true);
    }
  } catch (error) {
    console.error("DFS failed:", error);
    alert("DFS traversal failed. Please try again.");
  }
};

  //Resets the AVL tree or traversal states depending on current mode.
const handleReset = async () => {
  try {
    if (resetMode === "Reset") {
      await TREE_API.resetTree();
      setTreeData(null);
      setLogs([]);
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
  } catch (error) {
    console.error("Reset failed:", error);
    alert(`Reset operation (${resetMode}) failed. Please try again.`);
  }
};

  
  
  
  //Converts AVL tree to array representation for display.
  //Fills empty spots with "None" for missing children
  const buildArrayTree = (node, index = 0, array = []) => {
    while (array.length <= index) {
      array.push("None");
    }
  
    array[index] = node ? node.name : "None";
  
    if (node) {
      buildArrayTree(node.left, 2 * index + 1, array);
      buildArrayTree(node.right, 2 * index + 2, array);
    }
    // Trim trailing "None" values
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

  
  
  //Initial fetch when component mounts
  useEffect(() => {
    fetchTree();
  }, []);
  //Renders AVL tree recursively as SVG nodes and edges.
  // Highlights nodes during traversal (BFS/DFS).
  const renderTree = (node, x, y, level = 0, parentPos = null, posIndex = 0) => {
    if (!node) return [];
  
    const horizontalGap = 280;
    const nextY = y + 80;
    const offset = horizontalGap / (level + 4);
  
    const leftX = x - offset * Math.pow(2, 2 - level);  
    const rightX = x + offset * Math.pow(2, 2 - level);
  
    const elements = [];
     // Draw edge to parent
    if (parentPos) {
      const dx = x - parentPos.x;
      const dy = y - parentPos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
  
      const shorteningFactor = 1.2;
      const rawOffset = 20 * shorteningFactor;
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
     // Draw current node
    elements.push(
      <g key={`node-${x}-${y}`}>
        <circle cx={x} cy={y} r={20} 
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
     // Recursively render children
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
      {/* Buttons */}
      <div className="header">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter a domain or full URL"
        />
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleBFS}>Run BFS</button>
        <button onClick={handleDFS}>Run DFS</button>
      </div>
       {/* Array display */}
      <h3>Tree Nodes: {treeData && treeData.name ? buildArrayTree(treeData).join(", ") : "No data"}</h3>
      {/* SVG Tree Visualization */}
      <svg className="svg">
        <rect className="svg-bg" />
        {treeData && treeData.name && renderTree(treeData, 500, 80)}
      </svg>
      {/* Log panel */}
      {logs.length > 0 && (
    <div className="logPanel">
    <div className="logTitle">Logs</div>
    <div className="logScroll">
      {logs.map((log, index) => (
        <div key={index}>
        {log}
        </div>
      ))}
    </div>
    </div>
      )}
      {/* Reset button */}
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
