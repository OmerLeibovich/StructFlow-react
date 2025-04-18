import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { TREE_API } from "../api"; 


const AVLTree = () => {
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem("treeNodes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [bfsOrder, setBfsOrder] = useState(() => {
    const saved = localStorage.getItem("bfsOrder");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [dfsOrder, setDfsOrder] = useState(() => {
    const saved = localStorage.getItem("dfsOrder");
    return saved ? JSON.parse(saved) : [];
  });
  const [resetLabel, setResetLabel] = useState(() => {
    const saved = localStorage.getItem("resetLabel");
    return saved ? JSON.parse(saved) : "Reset";
  });
  
  const [videoSrcAVL, setVideoSrcAVL] = useState( TREE_API.getVideoStreamAVL());

  const fetchTreeData = useCallback(async () => {
    const data = await  TREE_API.getTree();
    if (data.nodes) {
      setNodes((prevNodes) =>
        JSON.stringify(prevNodes) !== JSON.stringify(data.nodes) ? data.nodes : prevNodes
      );
    }
  }, []);




  useEffect(() => {
    const interval = setInterval(() => {
      setVideoSrcAVL( TREE_API.getVideoStreamAVL());
    }, 200);
    if (!sessionStorage.getItem("sessionActive")) {
      sessionStorage.setItem("sessionActive", "true");
    }

    fetchTreeData(); 

    return () => clearInterval(interval); 
  },  [fetchTreeData]);





  
  useEffect(() => {
    localStorage.setItem("treeNodes", JSON.stringify(nodes));
    localStorage.setItem("bfsOrder", JSON.stringify(bfsOrder));
    localStorage.setItem("dfsOrder", JSON.stringify(dfsOrder));
    localStorage.setItem("resetLabel", JSON.stringify(resetLabel));
  }, [nodes, bfsOrder, dfsOrder,resetLabel]);
  
  


  const handleInsert = async () => {
    if (!inputValue) return alert("Error: Please enter a number!");

    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    if (isNaN(numValue) || numValue < 0 || numValue > 999) {
      return alert("Error: Number must be between 0 and 999!");
    }
    if (nodes.includes(numValue)) return alert("Error: Number already exists!");

    const result = await TREE_API.insertNode(numValue);
    if (!result.error) {
      
      fetchTreeData();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async () => {;
    if (!inputValue) return alert("Error: Please enter a number!");
    
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    if (!nodes.includes(numValue)) return alert("Error: Number does not exist!");

    const result = await  TREE_API.deleteNode(numValue);
    if (!result.error) {
      fetchTreeData();
    } else {
      alert(result.error);
    }
  };

  const handleBFS = async () => {
    const result = await  TREE_API.startBFS();
    setInputValue("");
    if (!result.error) {
      localStorage.setItem("bfsOrder", JSON.stringify(result.bfs_order)); 
      localStorage.setItem("resetLabel", "BFS_Reset"); 
      setBfsOrder(result.bfs_order);
      setResetLabel("BFS_Reset");
    } else {
      alert(result.error);
    }
  };

  const handleDFS = async () => {
    const result = await  TREE_API.startDFS();
    setInputValue("");
    if (!result.error) {
      localStorage.setItem("dfsOrder", JSON.stringify(result.dfs_order)); 
      localStorage.setItem("resetLabel", "DFS_Reset"); 
      setDfsOrder(result.dfs_order);
      setResetLabel("DFS_Reset");
    } else {
      alert(result.error);
    }
  };
  const handleReset = async () => {
    setInputValue("");
  
    if (resetLabel === "BFS_Reset") {
      await TREE_API.resetBFS();
      setBfsOrder([]);
      setResetLabel("Reset")
      localStorage.removeItem("bfsOrder");
  
  
    } else if (resetLabel === "DFS_Reset") {
      await TREE_API.resetDFS();
      setDfsOrder([]);
      setResetLabel("Reset")
      localStorage.removeItem("dfsOrder");
  
    } else {
      await TREE_API.resetTree();
      setNodes([]);
      setBfsOrder([]);
      setDfsOrder([]);
      localStorage.removeItem("treeNodes");
      localStorage.removeItem("bfsOrder");
      localStorage.removeItem("dfsOrder");
      localStorage.clear();

    }
  
    fetchTreeData();
  };
  
  

  const formatList = (list) => {
    return list
      .filter((item, index, arr) => 
        item !== null || index < arr.length - 1 
      )
      .map((item, index) => 
        index === 0 ? item : "," + item  
      )
      .join(" ");
};

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Insert number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
      />
      <button onClick={handleInsert}>Insert</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleBFS}>BFS</button>
      <button onClick={handleDFS}>DFS</button>
      <h3>Tree Nodes: {formatList(nodes)}</h3>
      <h3>BFS Order: {bfsOrder.join(", ")}</h3>
      <h3>DFS Order: {dfsOrder.join(", ")}</h3>
      <div className="pygameHeader">
        <img
          src={videoSrcAVL}
          alt="AVL Tree"
          className="pygamescreen"
        />
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>
      </div>


      <div className="resetButtonBackground">
          <button onClick = {handleReset} className="resetButton">
        {resetLabel}
        </button>
            </div>


      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>AVL Tree Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>*Insert Button: Add a number to the AVL Tree.</p>
          <p>*Delete Button: Remove a number from the AVL Tree.</p>
          <p>*BFS Button: Press multiple times to see BFS order.</p>
          <p>*DFS Button: Press multiple times to see DFS order.</p>
          <p>*Reset: reset to current state.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AVLTree;
