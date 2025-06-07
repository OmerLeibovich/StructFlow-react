import React, { useEffect, useRef, useState, useCallback } from "react";
import "../App.css";
import { TREE_API } from "../api";
import { animateTraversal, animateNodeMovements }from "../Components/Animate";
import TreeCircle from "./TreeNode";

const AVLTreeVisualizer = () => {
  //initialize variables
  const [treeData, setTreeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [HighlightsNodes, setHighlightsNodes] = useState([]);
  const [bfsMode, setBfsMode] = useState(false);
  const [dfsMode, setDfsMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [resetMode, setResetMode] = useState("Reset");
  const inputRef = useRef(null);
  const [prevPositions, setPrevPositions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const nodeRefs = useRef({});
  const bfsPath = useRef([]); 
  const dfsPath = useRef([]);
  const svgRef = useRef(null);




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
  if (treeData) {
    const prev = getNodePositions(treeData, 500, 80);
    setPrevPositions(prev);
  }
  const res = await TREE_API.getTree();
  setTreeData(res);
};




  //Inserts a new node into the AVL tree.
  //  Prevents insert during BFS/DFS mode.
  const handleInsert = async () => {
    const num = parseInt(inputValue);
    if (isNaN(num) || bfsMode || dfsMode || num < 0 || num > 99999 || containsValue(treeData, num) || isProcessing) {
      alert("Invalid input or operation");
      setInputValue("");
      inputRef.current?.focus();
      return;
    }

    try {
      setIsProcessing(true); 
      const oldRoot = treeData?.name;
      const res = await TREE_API.insertNode(num);
      const path = res.path || [];
      const didRotate = res.rotate;
      const newRoot = res.root;

      setLogs(prev => [
      ...prev,
        <span key={prev.length}>
          Inserted <strong>{num}</strong>.{" "}
          {path.length > 0 && (
          <>
          Path: <strong style={{ color: "blue" }}>{path.join(" → ")}</strong>.
          <br />
          {path.length > 0 && ` ${num} Inserted as child of ${path[path.length - 1]}.`}
          </>
          )}
        </span>
      ]);
      if (oldRoot && newRoot && oldRoot !== newRoot) {
        setLogs(prev => [
          ...prev,
          <span key={prev.length}>
            Tree root changed from <strong>{oldRoot}</strong> to <strong>{newRoot}</strong>.
          </span>
        ]);
      }
      await animateTraversal(path, setHighlightsNodes, nodeRefs, null, true);
      if (didRotate) await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      alert("Insert failed");
    } finally {
      await fetchTree();
      setHighlightsNodes([]);
      setInputValue("");
      inputRef.current?.focus();
      setIsProcessing(false);
    }
  };


  //Deletes a node from the AVL tree.
  // Prevents delete during BFS/DFS mode.
  
  const handleDelete = async () => {
    const num = parseInt(inputValue);
    if (isNaN(num) || bfsMode || dfsMode || !containsValue(treeData, num) || isProcessing) {
      alert("Invalid input or operation");
      setInputValue("");
      inputRef.current?.focus();
      return;
    }

    try {
      setIsProcessing(true);
      const res = await TREE_API.deleteNode(num);
      const path = res.path || [];
      const didRotate = res.rotate;
      const replacement = res.replacement;
      setLogs(prev => [
      ...prev,
      <span key={prev.length}>
        Deleted <strong>{num}</strong>.{" "}
        {path.length > 0 && (
        <>
        Path: <strong style={{ color: "orange" }}>{path.join(" → ")}</strong>.
        <br />
        {replacement && ` Replaced with successor: ${replacement}.`}
        </>
        )}
      </span>
      ]);
      await animateTraversal(path, setHighlightsNodes, nodeRefs, replacement, false);
      if (didRotate) await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      alert("Delete failed");
    } finally {
      await fetchTree();
      setHighlightsNodes([]);
      setInputValue("");
      inputRef.current?.focus();
      setIsProcessing(false);
    }
  };

  //Runs BFS traversal on the AVL tree.
  // Highlights nodes during traversal.
const handleBFS = async () => {
  if (dfsMode || isProcessing) {
    alert("Cannot perform BFS while another operation is in progress.");
    return;
  }

  try {
    setIsProcessing(true);
    const res = await TREE_API.startBFS();
    setResetMode("ResetBFS");

    if (res.highlighted_nodes) {
      const LastSet = HighlightsNodes.length;
      const newVisited = res.highlighted_nodes.slice(LastSet);
      setHighlightsNodes(res.highlighted_nodes.map(n => ({ key: n, color: "red" })));

      

      if (newVisited.length > 0) {

        bfsPath.current.push(newVisited);

     
        const pathText = bfsPath.current
          .map(group => group.join(", "))
          .join(" → ");

        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            BFS path: <strong style={{ color: "blue" }}>{pathText}</strong>
          </span>
        ]);

        console.log(`BFS path: ${pathText}`);
      }

      setBfsMode(true);
    }
  } catch (error) {
    console.error("BFS failed:", error);
    alert("BFS traversal failed. Please try again.");
  }
  finally{
    setIsProcessing(false);
  }
};



  //Runs DFS traversal on the AVL tree.
  // Highlights nodes during traversal.
const handleDFS = async () => {
  if (bfsMode || isProcessing) {
    alert("Cannot perform DFS while another operation is in progress.");
    return;
  }

  try {
    setIsProcessing(true);
    const res = await TREE_API.startDFS();
    setResetMode("ResetDFS");

    if (res.DFS_Targets && JSON.stringify(res.DFS_Targets) !== JSON.stringify(dfsPath.current)) {
      setDfsMode(true);
      dfsPath.current = res.DFS_Targets;

      const path = [...res.DFS_Targets];
      setHighlightsNodes(path.map(n => ({ key: n, color: "red" })));

      setLogs(prev => [
        ...prev,
        <span key={prev.length}>
          DFS path: <strong style={{ color: "blue" }}>{path.join(" → ")}</strong>
        </span>
      ]);

      await new Promise(resolve => setTimeout(resolve, 400));
    }
  } catch (error) {
    console.error("DFS failed:", error);
    alert("DFS traversal failed. Please try again.");
  }
  finally{
    setIsProcessing(false);
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
      bfsPath.current = [];
    } else if (resetMode === "ResetDFS") {
      await TREE_API.resetDFS();
      setDfsMode(false);
    }

    fetchTree();
    setResetMode("Reset");
    setHighlightsNodes([]);
  } catch (error) {
    console.error("Reset failed:", error);
    alert(`Reset operation (${resetMode}) failed. Please try again.`);
  }
};

  
  
const getNodePositions = useCallback((node, x, y, level = 0, positions = {}) => {
  if (!node) return positions;

  const isMobile = window.innerWidth <= 600;
  const horizontalGap = isMobile ? 140 : 280;
  const offset = horizontalGap / (level + 4);
  const leftX = x - offset * Math.pow(2, 2 - level);  
  const rightX = x + offset * Math.pow(2, 2 - level);
  positions[node.name] = { x, y };

  getNodePositions(node.left, leftX, y + 80, level + 1, positions);
  getNodePositions(node.right, rightX, y + 80, level + 1, positions);

  return positions;
}, []);


  
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
  const updateWidth = () => {
    if (svgRef.current) {
    }
  };

  updateWidth();
  window.addEventListener("resize", updateWidth);

  if (treeData) {
    animateNodeMovements(treeData, prevPositions, setPrevPositions, nodeRefs, getNodePositions);
  }

  return () => {
    window.removeEventListener("resize", updateWidth);
  };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [treeData, getNodePositions]);


  //Renders AVL tree recursively as SVG nodes and edges.
  // Highlights nodes during traversal (BFS/DFS).
 const renderTree = (node, x, y, level = 0, parentPos = null) => {
    if (!node) return [];
    const horizontalGap = 280;
    const nextY = y + 80;
    const offset = horizontalGap / (level + 4);
    const leftX = x - offset * Math.pow(2, 2 - level);
    const rightX = x + offset * Math.pow(2, 2 - level);
    const elements = [];

    if (parentPos) {
      const dx = x - parentPos.x;
      const dy = y - parentPos.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx / length) * Math.min(20 * 1.2, length / 2.2);
      const offsetY = (dy / length) * Math.min(20 * 1.2, length / 2.2);
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

    if (!nodeRefs.current[node.name]) {
      nodeRefs.current[node.name] = React.createRef();
    }

      let nodeColor = "grey";
      if (Array.isArray(HighlightsNodes)) {
        const match = HighlightsNodes.find(n =>
          typeof n === "object" ? n.key === node.name : n === node.name
        );
        if (match) {
          nodeColor = typeof match === "object" ? match.color : "red";
        }
      }
    elements.push(
     <TreeCircle
        key={`node-${x}-${y}`}
        i={node.name}
        value={node.name}
        x={x - 30}
        y={y - 30}
        color={nodeColor}
        offset={0}
        ref={nodeRefs.current[node.name]}
      />
    );

    elements.push(...renderTree(node.left, leftX, nextY, level + 1, { x, y }));
    elements.push(...renderTree(node.right, rightX, nextY, level + 1, { x, y }));

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
          placeholder="Enter a number"
        />
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleDelete} >Delete</button>
        <button onClick={handleBFS} >Run BFS</button>
        <button onClick={handleDFS} >Run DFS</button>

      </div>
       {/* Array display */}
      <h3>Tree Nodes: {treeData && treeData.name ? buildArrayTree(treeData).join(", ") : "No data"}</h3>
      {/* SVG Tree Visualization */}
      <svg className="svg" ref={svgRef}>
        <rect className="svg-bg" />
       {treeData && treeData.name && renderTree(treeData, (svgRef.current?.clientWidth || window.innerWidth) / 2, 80)}
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
