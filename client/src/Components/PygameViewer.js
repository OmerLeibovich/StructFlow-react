import React, { useState, useEffect, useCallback} from "react";
import '../App.css';
import { Button } from "react-bootstrap";

const AVLTree = () => {
  const [inputValue, setInputValue] = useState("");
  const [nodes, setNodes] = useState([]);
  const [bfsOrder, setBfsOrder] = useState([]);
  const [dfsOrder, setDfsOrder] = useState([]);

  const fetchTreeData = useCallback(async () => {
    const response = await fetch("http://127.0.0.1:5000/get_tree");
    const data = await response.json();
    
  
    setNodes((prevNodes) => 
      JSON.stringify(prevNodes) !== JSON.stringify(data.nodes) ? data.nodes : prevNodes
    );
  }, []);  
  
  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);



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
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
  
      setInputValue("");
      await fetchTreeData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleDelete = async () => {
    if (!inputValue) {
      alert("Error: Please enter a number!");
      return;
    }
  
    const numValue = parseInt(inputValue, 10);
  
    if (isNaN(numValue)) {
      setInputValue("");
      alert("Error: Invalid number!");
      return;
    }
  
    if (!nodes.includes(numValue)) {
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
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
  
      setInputValue("");
      await fetchTreeData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleBFS = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/bfs");
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
  
      setBfsOrder(data.bfs_order);
    } catch (error) {
      setInputValue("");
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleDFS = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/dfs");
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
  
      setDfsOrder(data.dfs_order);
    } catch (error) {
      setInputValue = ""
      alert(`Error: ${error.message}`);
    }
  };
  
  const Reset = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/reset");
      const data = await response.json();
  
      setNodes([]);
      setDfsOrder([]);
      setBfsOrder([]);
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
      type="text"  // שים לב ששינינו ל-"text" כדי לשלוט טוב יותר על הקלט
      placeholder="Insert number"
      value={inputValue}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ""); // מסיר כל תו שאינו מספר
        setInputValue(value);
      }}
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
        style={{ width: "600px", height: "600px", border: "2px solid black" }}
      />
    </div>

    {/* כפתור Reset ברוחב מלא מתחת לחלון */}
    <div style={{ width: "600px", margin: "20px auto" }}>
      <Button onClick={Reset} style={{ width: "100%", height: "50px", fontSize: "18px" }}>
        Reset
      </Button>
    </div>
  </div>
)};

export default AVLTree;