import React, { useState, useEffect, useCallback} from "react";
import '../App.css';

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
    if (!inputValue) return;
    try {
      await fetch("http://127.0.0.1:5000/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: inputValue }),
      });
      setInputValue("");
      await fetchTreeData(); 
    } catch (error) {
      console.error("Error inserting node:", error);
    }
  };

  const handleDelete = async () => {
    if (!inputValue) return;
    try {
      await fetch("http://127.0.0.1:5000/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: inputValue }),
      });
      setInputValue("");
      await fetchTreeData(); 
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };
  const handleBFS = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/bfs");
      const data = await response.json();
      setBfsOrder(data.bfs_order); 
    } catch (error) {
      console.error("Error fetching BFS data:", error);
    }
  };
  

  const handleDFS = async () => {
    const response = await fetch("http://127.0.0.1:5000/dfs");
    const data = await response.json();
    setDfsOrder(data.dfs_order);
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
      <h2>AVL Tree</h2>
      <input
      className="without_arrow"
        type="number"
        placeholder="הכנס מספר"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
     <button onClick={handleInsert}>Insert</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleBFS}>BFS</button>
      <button onClick={handleDFS}>DFS</button>
      <h3>Tree Nodes: {formatList(nodes)}</h3>
      <h3>BFS Order: {formatList(bfsOrder)}</h3>
      <h3>DFS Order: {formatList(dfsOrder)}</h3>
      <img
        src={`http://127.0.0.1:5000/video_feed_AVL_Tree?t=${Date.now()}`} 
        alt="AVL Tree"
        style={{ width: "600px", height: "600px", border: "2px solid black" }}
      />
    </div>
  );
};

export default AVLTree;


