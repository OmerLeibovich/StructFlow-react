import React, {useState,useEffect,useRef} from "react";
import "../App.css";
import { Button, Modal } from "react-bootstrap";
import { ARRAY_API } from "../api"; 

const Array = () => {
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [arrayData, setArrayData] = useState([]);
  const [highlightIndices, setHighlightIndices] = useState([]);
  const [sortActive,setSortActive] = useState(false);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [logs, setLogs] = useState([])
  const inputRef = useRef(null);


  useEffect(() => {
      const scrollBox = document.querySelector(".logScroll");
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
      fetchArrayData();
    }, [logs]);
    


  const fetchArrayData = async () => {
  const result = await ARRAY_API.getArray();
  console.log("Fetched arrayData:", result);
  setArrayData(result.array);
};


 const handleInsert = async () =>{
  if (!inputValue) return alert("Error: Please enter a number!");
  if (sortActive) return alert("can't instert when sort activate")
      const numValue = parseInt(inputValue, 10);
      setInputValue("");
      // Validate number range
      if (isNaN(numValue) || numValue < 0 || numValue > 9999) {
        return alert("Error: Number must be between 0 and 999!");
      }
      try {
      await ARRAY_API.insertArray(numValue);
      setLogs((prev) => [...prev, 
      <span key={prev.length}>
      Insert <strong style={{color: "greenyellow"}}>{numValue}</strong> to the array
      </span>
      ]);
      }
      catch (error) {
      console.error("Insert failed:", error);
      alert("Unexpected error occurred while inserting number.");
    }
    finally{
      fetchArrayData();
      inputRef.current?.focus();
    }
    };
    const handleDelete = async () => {
      if (!inputValue) return alert("Error: Please enter a number!");
    
      const numValue = parseInt(inputValue, 10);
      if (isNaN(numValue) || numValue < 0 || numValue > 9999) {
        return alert("Error: Number must be between 0 and 999!");
      }
        try{
        setInputValue("");
        await ARRAY_API.removeArray(numValue);
        setInputValue("");
        setLogs((prev) => [...prev, 
          <span key={prev.length}>
          Removed <strong style={{ color :"red" }}>{numValue}</strong> from the array
          </span>
          ]);
        }
        catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete the last node from the linked list.");
      }
        finally {
        await fetchArrayData();
        inputRef.current?.focus();
      }
      };
  const BubbleSort = async () => {
  setSortActive(true);
  try {
    const result = await ARRAY_API.BubbleSort();
    const steps = result.steps;
    const finalSortedArray = result.sorted_array;
    let i = 0;

    const processStep = () => {
      if (i >= steps.length) {
        setHighlightIndices([]);
        setSwappedIndices([]);
        setArrayData(finalSortedArray);
        setSortActive(false);
        return;
      }

      const step = steps[i];
      setArrayData(step.array);
      setHighlightIndices(step.highlight);
      setSwappedIndices(step.swapped ? step.highlight : []);

      if (step.swapped && step.highlight.length === 2) {
        const [i1, i2] = step.highlight;
        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            Swapped <strong style={{ color: "red" }}>{step.array[i2]}</strong> and <strong style={{ color: "red" }}>{step.array[i1]}</strong>
          </span>
        ]);
      }

      i++;

      const delay = step.swapped ? 2000 : 1000; 
      setTimeout(processStep, delay);
    };

    processStep();
  } catch (error) {
    console.error("BubbleSort failed:", error);
    alert("Sorting failed.");
    setSortActive(false);
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
    <button onClick={BubbleSort}>BubbleSort</button>

    <div className="svgContainer">
      <svg className="svg">
      <rect className="svg-bg" />
        {arrayData.map((value, i) => {
  const x = i * (60 + 20) + 20;
  const y = 200;
  let color = "grey";
  if (swappedIndices.includes(i)) color = "green";
  else if (highlightIndices.includes(i)) color = "yellow";

      return (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={60}
            height={60}
            fill={color}
            stroke="black"
            strokeWidth="2"
          />
          <text
            x={x + 30}
            y={y + 35}
            textAnchor="middle"
            fontSize="20"
            fill="black"
          >
            {value}
          </text>
        </g>
      );
    })}
      </svg>
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

    <div className="FixedButtonsContainer">
      {/* <button className="SortButtons" onClick={BubbleSort}>BubbleSort</button>
      <button className="SortButtons" onClick={AnotherSortFunction}>Another Sort</button> */}
    </div>

    <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
      Explanation
    </button>

    <div className="resetButtonBackground">
      {/* <button className="resetButton" onClick={handleReset}>reset</button> */}
    </div>

    <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
      <Modal.Header closeButton>
        <Modal.Title>DoubleLinkedList Tutorial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>*Insert Button: Add a number to the head or tail of LinkedList (you choose).</p>
        <p>*Delete Button: Remove a number from the head or tail of LinkedList (you choose).</p>
        <p>*Search Button: Search the input number in the LinkedList.</p>
        <p>*head/tail Button: Choose the side of the list you want to insert/delete node.</p>
        <p>*Reset: reset to current state.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  </div>
);
}
export default Array;
