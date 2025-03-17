import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";

const AVLTree = () => {
  const [inputValue, setInputValue] = useState("");
  const [nodes, setNodes] = useState([]);
  const [bfsOrder, setBfsOrder] = useState([]);
  const [dfsOrder, setDfsOrder] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [resetLabel, setResetLabel] = useState("Reset");

  const fetchTreeData = useCallback(async () => {
    const response = await fetch("http://127.0.0.1:5000/get_tree");
    const data = await response.json();

    setNodes((prevNodes) =>
      JSON.stringify(prevNodes) !== JSON.stringify(data.nodes) ? data.nodes : prevNodes
    );
  }, []);
  useEffect(() => {
    const isNewSession = !sessionStorage.getItem("sessionActive");

    if (isNewSession) {
      localStorage.clear(); 
      sessionStorage.setItem("sessionActive", "true"); 
    }

    const savedNodes = localStorage.getItem("treeNodes");
    const savedBFS = localStorage.getItem("bfsOrder");
    const savedDFS = localStorage.getItem("dfsOrder");
    const savedResetLabel = localStorage.getItem("resetLabel");

    if (savedNodes) setNodes(JSON.parse(savedNodes));
    if (savedBFS) setBfsOrder(JSON.parse(savedBFS));
    if (savedDFS) setDfsOrder(JSON.parse(savedDFS));
    if (savedResetLabel) setResetLabel(savedResetLabel);

    fetchTreeData(); 
}, [fetchTreeData]);


  
  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem("treeNodes", JSON.stringify(nodes));
    }
  }, [nodes]);
  
  useEffect(() => {
    if (bfsOrder.length > 0) {
      localStorage.setItem("bfsOrder", JSON.stringify(bfsOrder));
    }
  }, [bfsOrder]);
  
  useEffect(() => {
    if (dfsOrder.length > 0) {
      localStorage.setItem("dfsOrder", JSON.stringify(dfsOrder));
    }
  }, [dfsOrder]);
  
  useEffect(() => {
    localStorage.setItem("resetLabel", resetLabel); 
  }, [resetLabel]);
  
  
  const handleInsert = async () => {
    if (!inputValue) {
      alert("Error: Please enter a number!");
      return;
    }

    const numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || numValue < 0 || numValue > 999) {
      setInputValue("");
      alert("Error: Number must be between 0 and 999!");
      return;
    }

    if (nodes.includes(numValue)) {
      setInputValue("");
      alert("Error: Number already exists in the tree!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: numValue }),
      });

      if (!response.ok) {
        throw new Error("Insertion failed");
      }
      setInputValue("");
      await fetchTreeData();
    } catch (error) {
      setInputValue("");
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!inputValue) {
      alert("Error: Please enter a number!");
      return;
    }

    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || !nodes.includes(numValue)) {
      setInputValue("");
      alert("Error: Number does not exist in the tree!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: numValue }),
      });

      if (!response.ok) {
        throw new Error("Deletion failed");
      }
      setInputValue("");
      await fetchTreeData();
    } catch (error) {
      setInputValue("");
      alert(`Error: ${error.message}`);
    }
  };

  const handleBFS = async () => {
    setInputValue("");
    try {
      const response = await fetch("http://127.0.0.1:5000/bfs");
      const data = await response.json();

      
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      localStorage.setItem("bfsOrder", JSON.stringify(data.bfs_order)); 
      localStorage.setItem("resetLabel", "BFS_Reset"); 
      setBfsOrder(data.bfs_order);
      setResetLabel("BFS_Reset");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDFS = async () => {
    setInputValue("");
    try {
      const response = await fetch("http://127.0.0.1:5000/dfs");
      const data = await response.json();

      
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      localStorage.setItem("dfsOrder", JSON.stringify(data.dfs_order)); 
      localStorage.setItem("resetLabel", "DFS_Reset"); 
      setDfsOrder(data.dfs_order);
      setResetLabel("DFS_Reset");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const Reset = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/reset");
      if (!response.ok) {
        throw new Error("Failed to reset the tree");
      }
  
      localStorage.clear(); 
      setNodes([]); 
      setDfsOrder([]);
      setBfsOrder([]);
      setResetLabel("Reset");
  
    } catch (error) {
      console.error("Error resetting tree:", error);
    }
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
    <div style={{ textAlign: "center" }}>
      <input
        className="without_arrow"
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
      <h3>BFS Order: {formatList(bfsOrder)}</h3>
      <h3>DFS Order: {formatList(dfsOrder)}</h3>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={`http://127.0.0.1:5000/video_feed_AVL_Tree?t=${Date.now()}`}
          alt="AVL Tree"
          style={{ width: "700px", height: "650px", border: "2px solid black" }}
        />
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>
      </div>
        
      <div style={{ width: "600px", margin: "20px auto" }}>
        <Button onClick={Reset} style={{ width: "100%", height: "50px", fontSize: "18px" }}>
          {resetLabel}
        </Button>
      </div>

      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>AVL Tree Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Insert Button: Add a number to the AVL Tree.</p>
          <p>Delete Button: Remove a number from the AVL Tree.</p>
          <p>After building the tree:</p>
          <p>BFS Button: Press multiple times to see BFS order.</p>
          <p>DFS Button: Press multiple times to see DFS order.</p>
          <p>After pressing Left or Right, press Space to clear.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AVLTree;