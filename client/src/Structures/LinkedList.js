import React, { useState, useEffect , useRef } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { LINKED_LIST_API } from "../api";

const LinkedList = () => {
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodesData, setNodesData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);
  

  useEffect(() => {
    const scrollBox = document.querySelector(".logScroll");
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
  }, [logs]);
  


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
      setLogs((prev) => [...prev, 
      <span key={prev.length}>
      The number  <strong style={{ color: "green" }}>{numValue}</strong> inserted to the linkedList
      </span>
      ]);
    }
    inputRef.current?.focus();
  };
  
  const handleDelete = async () => {
    if (isDeleting) return; 
    setIsDeleting(true);

    setInputValue("");
    const lastValue = nodesData.length > 0 ? nodesData[nodesData.length - 1].value : "None";
    const result = await LINKED_LIST_API.deleteLinkedList();
    if (result.error) {
      alert(result.error);
    } else {
      await fetchLinkedListData();
      setLogs((prev) => [
        ...prev,
        <span key={prev.length}>
          The number <strong style={{ color: "red" }}>{lastValue}</strong> was removed from the tail of the linkedlist
        </span>
      ]);
      inputRef.current?.focus();
    }
    setIsDeleting(false)
  };
  
  const handleSearch = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Start Search number <strong>{numValue}</strong> in the linkedList
      </span>
      ]);
  
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
      else {
        const found = steps.some(step => step.status === "found");
        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            {found ? (
              <>Number <strong style={{ color: "green" }}>{numValue}</strong> found in the linkedlist </>
            ) : (
              <>Number <strong style={{ color: "red" }}>{numValue}</strong> not found in the linkedlist</>
            )}
          </span>
        ]);
      }
    };
  
    animate();
    inputRef.current?.focus();
  };
  
  
  const handleReset = async () => {
    setInputValue("");
    const result = await LINKED_LIST_API.resetLinkedList();
    setLogs("");
    if (result.error) {
      alert(result.error);
    } else {
      await fetchLinkedListData();
    }
  };
  

  return (
    <div className="App">
      <input
        ref={inputRef}
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
    
    {i < nodesData.length - 1 && (() => {
      const nextNode = nodesData[i + 1];

      if (Math.abs(node.y - nextNode.y) < 10) {
        return (
          <>
            <line
              x1={node.x + 25}
              y1={node.y}
              x2={nextNode.x - 25}
              y2={nextNode.y}
              stroke="black"
              strokeWidth={3}
            />
            <polygon
              points={`${nextNode.x - 30},${nextNode.y - 5} ${nextNode.x - 30},${nextNode.y + 5} ${nextNode.x - 25},${nextNode.y}`}
              fill="black"
            />
          </>
        );
      } else if (nextNode.y > node.y) {
        return (
          <>
           
            <line
              x1={node.x + 25}
              y1={node.y}
              x2={node.x + 60}
              y2={node.y}
              stroke="black"
              strokeWidth={3}
            />
                  <polygon
            points={`
              ${node.x + 60},${node.y}
              ${node.x + 55},${node.y - 5}
              ${node.x + 55},${node.y + 5}
            `}
            fill="black"
          />
                    <line
            x1={nextNode.x - 60}
            y1={nextNode.y}
            x2={nextNode.x }
            y2={nextNode.y}
            stroke="black"
            strokeWidth={3}
          />
          <polygon
            points={`
              ${nextNode.x - 25},${nextNode.y}
              ${nextNode.x - 30},${nextNode.y - 5}
              ${nextNode.x - 30},${nextNode.y + 5}
            `}
                      fill="black"
                    />
                    </>
                  );
                }
              })()}
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
      {logs.length > 0 && (
  <div className="logPanel">
    <div className="logTitle">Logs</div>
    <div className="logScroll">
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  </div>
)}
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