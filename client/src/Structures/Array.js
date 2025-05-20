import React, {useState,useEffect,useRef,useCallback} from "react";
import "../App.css";
import { gsap } from "gsap";
import { Button, Modal } from "react-bootstrap";
import { ARRAY_API } from "../api"; 

const Array = () => {
  const [inputValue, setInputValue] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [arrayData, setArrayData] = useState([]);
  const [highlightIndices, setHighlightIndices] = useState([]);
  const [sortActive,setSortActive] = useState(false);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [, setRender] = useState(0);
  const offsetsRef = useRef({});
  const inputRef = useRef(null);
  const rectRefs = useRef({});


const fetchArrayData = useCallback(async () => {
  const result = await ARRAY_API.getArray();
  if (!sortActive) {
    setArrayData(result.array);
  }
}, [sortActive]);

useEffect(() => {
  const scrollBox = document.querySelector(".logScroll");
  if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
  fetchArrayData();
}, [logs, fetchArrayData]);

    
const forceRender = () => setRender((prev) => prev + 1);



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
    const result = await ARRAY_API.BubbleSort();
    const steps = result.steps;
    const finalSortedArray = result.sorted_array;

    let i = 0;
    let localArray = [...arrayData];
    const processStep = () => {
      if (i >= steps.length) {
        setHighlightIndices([]);
        setSwappedIndices([]);
        setArrayData(finalSortedArray);
        setSortActive(false);
        return;
      }

      const step = steps[i];
      const [i1, i2] = step.highlight;

      setHighlightIndices(step.highlight);
      setSwappedIndices(step.swapped ? step.highlight : []);

      const key1 = `${i1}`;
      const key2 = `${i2}`;
      const val1 = localArray[i1];  
      const val2 = localArray[i2];
      


      if (step.swapped) {
        const dx = (i2 - i1) * (60 + 20);
        offsetsRef.current[key1] = 0;
        offsetsRef.current[key2] = 0;
        
        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            <strong style={{ color: "red" }}>{val1}</strong> {'>'} from <strong style={{ color: "red" }}>{val2}</strong>
            <br />
            then: Swapped <strong style={{ color: "red" }}>{val1}</strong> and <strong style={{ color: "red" }}>{val2}</strong>
          </span>
        ]);

        gsap.to(offsetsRef.current, {
          [key1]: dx,
          [key2]: -dx,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: forceRender,
          onComplete: () => {
             [localArray[i1], localArray[i2]] = [localArray[i2], localArray[i1]];
          setArrayData([...localArray]);

            offsetsRef.current[key1] = 0;
            offsetsRef.current[key2] = 0;
            forceRender();
            i++;
            setTimeout(processStep, 400);
          }
        });
      } else {
        setLogs((prev) => [
          ...prev,
          <span key={prev.length}>
            <strong style={{ color: "red" }}>{val1}</strong> {'>'} from <strong style={{ color: "red" }}>{val2}</strong>
            <br />
            then: we dont swap them
          </span>
        ]);
        i++;
        setTimeout(processStep, 1000);
      }
    };

    processStep();
  };
  const handleReset = async () => {
    setInputValue("");
  
    try {
      await ARRAY_API.resetArray();
      setLogs(""); 
      setArrayData([]);
  
      
    } catch (error) {
      console.error("Reset failed:", error);
      alert("An unexpected error occurred while resetting the array.");
    }
    finally{
      fetchArrayData();
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
      const key = `${i}`;
      let color = "grey";
      if (swappedIndices.includes(i)) color = "green";
      else if (highlightIndices.includes(i)) color = "yellow";

      return (
        <g
          key={key}
          ref={(el) => {
            if (el) rectRefs.current[key] = el;
          }}
          transform={`translate(${offsetsRef.current[key] || 0}, 0)`}
        >
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

     {/* Reset button */}
      <div className="resetButtonBackground">
        <button onClick={handleReset} className="resetButton">
          Reset
        </button>
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

