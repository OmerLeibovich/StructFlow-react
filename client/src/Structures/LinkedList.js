import React, { useState, useEffect , useRef } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { LINKED_LIST_API } from "../api";
import NodeVisual from "./NodeVisual";

const LinkedList = () => {

  //initialize variables
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodesData, setNodesData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);
  
  //  useEffect hook to automatically scroll the logs panel to the bottom
  // whenever the logs state changes. This ensures the latest log message
  // is always visible to the user.
  useEffect(() => {
    const scrollBox = document.querySelector(".logScroll");
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
  }, [logs]);
  

  //  Fetches the current linked list data from the backend and updates the state with the nodes.
  const fetchLinkedListData = async () => {
    try {
      const res = await LINKED_LIST_API.getLinkedList();
      setNodesData(res?.nodes || []);
    } catch (error) {
      console.error("API Error:", error);
      setNodesData([]);
    }
  };
  // Load linked list data when component mounts
  useEffect(() => {
    fetchLinkedListData(); 
  }, []);
  
  // Handles insertion of a new number into the linked list.
  //  Validates input, sends to backend, and updates the UI.
  const handleInsert = async () => {
    if (!inputValue) return alert("Error: Please enter a number!");
  
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    // Validate number range
    if (isNaN(numValue) || numValue < 0 || numValue > 999) {
      return alert("Error: Number must be between 0 and 999!");
    }
    try {
    await LINKED_LIST_API.insertLinkedList(numValue);
    setLogs((prev) => [...prev, 
    <span key={prev.length}>
    The number  <strong style={{ color: "green" }}>{numValue}</strong> inserted to the linkedList.
    </span>
    ]);
    }
    catch (error) {
    console.error("Insert failed:", error);
    alert("Unexpected error occurred while inserting number.");
  }
  finally{
    fetchLinkedListData();
    inputRef.current?.focus();
  }
  };
  //Handles deletion of the last (tail) node from the linked list.
  const handleDelete = async () => {
    if (isDeleting) return; // Prevent double deletion with double click
    setIsDeleting(true);
    try{
    setInputValue("");
    const lastValue = nodesData.length > 0 ? nodesData[nodesData.length - 1].value : "None";
    await LINKED_LIST_API.deleteLinkedList();
    setLogs((prev) => [
      ...prev,
      <span key={prev.length}>
      The number <strong style={{ color: "red" }}>{lastValue}</strong> was removed from the tail of the linkedlist
      </span>
    ]);
    }
    catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete the last node from the linked list.");
  }
    finally {
    await fetchLinkedListData();
    inputRef.current?.focus();
    setIsDeleting(false);
  }
  };
  //  Handles search of a number in the linked list. 
  // Animates search steps by updating node states.
  const handleSearch = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Start Search number <strong>{numValue}</strong> in the linkedList
      </span>
      ]);
  
    try {
    const result = await LINKED_LIST_API.searchLinkedList(numValue);
  
    const steps = result.steps || [];
  
    let i = 0;
    // Animate each step with delay
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
        setTimeout(animate, 500);// delay between steps
      }
      else {
        const found = steps.some(step => step.status === "found");
          if (!found) {
            const resetNodes = nodesData.map((node) => ({
              ...node,
              search: false,
              highlight: false,
            }));
            setNodesData(resetNodes);
          }
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
    } catch (error) {
    console.error("Search failed:", error);
    alert("Unexpected error occurred during search.");
  }
finally{
  inputRef.current?.focus();
}
};
  
  // Resets the entire linked list and clears logs.
const handleReset = async () => {
  setInputValue("");

  try {
    await LINKED_LIST_API.resetLinkedList();
    setLogs(""); 

    
  } catch (error) {
    console.error("Reset failed:", error);
    alert("An unexpected error occurred while resetting the linked list.");
  }
  finally{
    fetchLinkedListData();
  }
};

  
      //Main component render.
    // Displays controls, SVG visualization, and logs panel.
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
        <svg className="svg">
        <rect className="svg-bg" />
        {nodesData.map((node, i) => (
  <g key={i}>
   <NodeVisual node={node} />
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
        {/* Tutorial modal button */}
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>
      </div>
      {/* Reset button */}
      <div className="resetButtonBackground">
        <button onClick={handleReset} className="resetButton">
          Reset
        </button>
      </div>
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
      {/* Explanation modal */}
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