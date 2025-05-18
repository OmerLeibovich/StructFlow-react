import React, { useEffect,useState,useRef } from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { DOUBLE_LINKED_LIST_API } from "../api";
import NodeVisual from "./NodeVisual";


const DoubleLinkedList = () => {
  const [nodesData, setNodesData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [side, setSide] = useState("tail");
  const [showExplanation, setShowExplanation] = useState(false);
  const [logs, setLogs] = useState([]);
  const inputRef = useRef(null);

  
    //  useEffect hook to automatically scroll the logs panel to the bottom
    // whenever the logs state changes. This ensures the latest log message
    // is always visible to the user.
    useEffect(() => {
      const scrollBox = document.querySelector(".logScroll");
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
    }, [logs]);

  const fetchList = async () => {
    const res = await DOUBLE_LINKED_LIST_API.getDoubleLinkedList(); 
    setNodesData(res.nodes);
  };


const handleInsert = async () => {
  if (!inputValue) {
    alert("Please enter a number");
    return;
  }

  const num = parseInt(inputValue);
  if (isNaN(num) || num < 0 || num > 999) {
    alert("Invalid number");
    return;
  }

  try {
    await DOUBLE_LINKED_LIST_API.insertDoubleLinkedList(num, side);
    setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Inserted <strong style={{ color: "green" }}>{num}</strong> to the <strong>{side}</strong> of the linkedlist
      </span>
      ]);
  } catch (error) {
    console.error("Insert failed:", error);
    alert("Failed to insert node. Please try again.");
  }
  finally{
     setInputValue("");
      fetchList();
      inputRef.current?.focus();
  }
};

  const handleDelete = async () => {
    try{
      const lastValue = nodesData.length > 0
      ? (side === "head" ? nodesData[0].value : nodesData[nodesData.length - 1].value)
      : "None";
    await DOUBLE_LINKED_LIST_API.deleteDoubleLinkedList(side);
     setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Removed <strong style={{ color: "red" }}>{lastValue}</strong> from the <strong>{side}</strong> of the linkedlist
      </span>
      ]);
    }
    catch (error){
      console.error("Deleted failed:", error);
    alert("Failed to Delete node. Please try again.");
    }
    finally{
    fetchList();
    setInputValue("");
    inputRef.current?.focus();
    }
  };

  const handleSearch = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const numValue = parseInt(inputValue, 10);
    setInputValue("");
    setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Start Search number <strong>{numValue}</strong> in the linkedList from <strong>{side}</strong>
      </span>
      ]);
  
    try {
    const result = await DOUBLE_LINKED_LIST_API.searchDoubleLinkedList(numValue,side);
  
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
  setInputValue("");
  inputRef.current?.focus();
}
};

  const handleReset = async () => {
    setInputValue("")
    try{
    await DOUBLE_LINKED_LIST_API.resetDoubleLinkedList()
    setLogs(""); 
    }
    catch (error) {
      console.error("Reset failed:", error);
      alert("An unexpected error occurred while resetting the linked list.");
  }
    finally{
    fetchList();
  }
};


  const renderArrow = (node1, node2, direction) => {
    const sameRow = Math.abs(node1.y - node2.y) < 10;

    if (sameRow) {
      const [x1, x2] =
        direction === "tail"
          ? [node1.x + 25, node2.x - 25]
          : [node1.x - 25, node2.x + 25];

      const arrowPoints =
        direction === "tail"
          ? `${node2.x - 30},${node2.y - 5} ${node2.x - 30},${node2.y + 5} ${node2.x - 25},${node2.y}`
          : `${node2.x + 30},${node2.y - 5} ${node2.x + 30},${node2.y + 5} ${node2.x + 25},${node2.y}`;

      return (
        <>
          <line
            x1={x1}
            y1={node1.y}
            x2={x2}
            y2={node2.y}
            stroke="black"
            strokeWidth={2}
          />
          <polygon points={arrowPoints} fill="black" />
        </>
      );
    } else {
      if (direction === "tail") {
        return (
          <>
            <line
              x1={node1.x + 25}
              y1={node1.y}
              x2={node1.x + 60}
              y2={node1.y}
              stroke="black"
              strokeWidth={2}
            />
            <polygon
              points={`
                ${node1.x + 60},${node1.y}
                ${node1.x + 55},${node1.y - 5}
                ${node1.x + 55},${node1.y + 5}
              `}
              fill="black"
            />
            <line
              x1={node2.x - 60}
              y1={node2.y}
              x2={node2.x}
              y2={node2.y}
              stroke="black"
              strokeWidth={2}
            />
            <polygon
              points={`
                ${node2.x - 25},${node2.y}
                ${node2.x - 30},${node2.y - 5}
                ${node2.x - 30},${node2.y + 5}
              `}
              fill="black"
            />
          </>
        );
      } else {
        return (
          <>
            <line
              x1={node1.x - 25}
              y1={node1.y}
              x2={node1.x - 60}
              y2={node1.y}
              stroke="black"
              strokeWidth={2}
            />
            <polygon
              points={`
                ${node1.x - 60},${node1.y}
                ${node1.x - 55},${node1.y - 5}
                ${node1.x - 55},${node1.y + 5}
              `}
              fill="black"
            />
            <line
              x1={node2.x + 60}
              y1={node2.y}
              x2={node2.x}
              y2={node2.y}
              stroke="black"
              strokeWidth={2}
            />
            <polygon
              points={`
                ${node2.x + 25},${node2.y}
                ${node2.x + 30},${node2.y - 5}
                ${node2.x + 30},${node2.y + 5}
              `}
              fill="black"
            />
          </>
        );
      }
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
      <button onClick={() => setSide(side === "tail" ? "head" : "tail")}>
        {side}
      </button>
      <button onClick={() => setShowExplanation(true)}>Explanation</button>

      <svg className="svg">
        <rect className="svg-bg" />
        {nodesData.map((node, i) => (
          <g key={i}>
           <NodeVisual node={node} />
            {side === "tail" && i < nodesData.length - 1 &&
              renderArrow(node, nodesData[i + 1], "tail")}

            {side === "head" && i > 0 &&
              renderArrow(node, nodesData[i - 1], "head")}
          </g>
        ))}
      </svg>
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
      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>DoubleLinkedList Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>* Insert: Add number at head or tail.</p>
          <p>* Delete: Remove number from head or tail.</p>
          <p>* Search: Search for a number.</p>
          <p>* Reset: Clear the list.</p>
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

export default DoubleLinkedList;
