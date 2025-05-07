import React, { useState, useEffect } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { LINKED_LIST_API } from "../api";

const LinkedList = () => {
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodesData, setNodesData] = useState([]);

  const fetchLinkedListData = async () => {
    try {
      const res = await LINKED_LIST_API.getLinkedList();
      setNodesData(res?.nodes || []);
    } catch (error) {
      console.error("API Error:", error);
      setNodesData([]);
    }
  };
  
  useEffect(() => {
    fetchLinkedListData(); 
  }, []);
  

  const handleInsert = async () => {
    if (!inputValue) return alert("Error: Please enter a number!");
  
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    if (isNaN(numValue) || numValue < 0 || numValue > 999) {
      return alert("Error: Number must be between 0 and 999!");
    }
  
    const result = await LINKED_LIST_API.insertLinkedList(numValue);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchLinkedListData();
    }
  };
  
  const handleDelete = async () => {
    setInputValue("");
    const result = await LINKED_LIST_API.deleteLinkedList();
    if (result.error) {
      alert(result.error);
    } else {
      await fetchLinkedListData();
    }
  };
  
  const handleSearch = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
  
    const result = await LINKED_LIST_API.searchLinkedList(numValue);
    if (result.error) return alert(result.error);
  
    const steps = result.steps || [];
  
    let i = 0;
    const animate = () => {
      if (i < steps.length) {
        const tempNodes = [...nodesData].map((node) => {
          if (node.x === steps[i].x && node.y === steps[i].y) {
            return {
              ...node,
              search: steps[i].status === "searching",
              highlight: steps[i].status === "found",
            };
          }
          return { ...node, search: false, highlight: false };
        });
        setNodesData(tempNodes);
        i++;
        setTimeout(animate, 500);
      }
    };
  
    animate();
  };
  
  
  const handleReset = async () => {
    setInputValue("");
    const result = await LINKED_LIST_API.resetLinkedList();
    if (result.error) {
      alert(result.error);
    } else {
      await fetchLinkedListData();
    }
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
      <button onClick={handleSearch}>Search</button>
      <div className="svgContainer">
        <svg width={700} height={650} style={{ background: "white", border: "1px solid black" }}>
          {nodesData.map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={25}
                fill={node.search ? "red" : node.highlight ? "green" : "blue"}
                stroke="black"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="16"
                fill="white"
              >
                {node.value}
              </text>
              {i < nodesData.length - 1 && (
                <>
                  <line
                    x1={node.x + 25}
                    y1={node.y}
                    x2={nodesData[i + 1].x - 25}
                    y2={nodesData[i + 1].y}
                    stroke="black"
                    strokeWidth={3}
                  />
                  <polygon
                    points={`${nodesData[i + 1].x - 30},${nodesData[i + 1].y - 5} ${nodesData[i + 1].x - 30},${nodesData[i + 1].y + 5} ${nodesData[i + 1].x - 25},${nodesData[i + 1].y}`}
                    fill="black"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>
      </div>
      <div className="resetButtonBackground">
        <button onClick={handleReset} className="resetButton">
          Reset
        </button>
      </div>
      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>LinkedList Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>* Insert Button: Add a number to the LinkedList.</p>
          <p>* Delete Button: Remove the tail node.</p>
          <p>* Search Button: Highlight a node if found.</p>
          <p>* Reset: Clear the entire list.</p>
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

export default LinkedList;