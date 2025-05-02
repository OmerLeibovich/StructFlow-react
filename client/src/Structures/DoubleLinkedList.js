import React, {useState,useEffect} from "react";
import "../App.css";
import { Button, Modal,Spinner } from "react-bootstrap";
import { DOUBLE_LINKED_LIST_API } from "../api"; 

const DoubleLinkedList = () =>{
    const [inputValue, setInputValue] = useState("");
    const [side,setSide] = useState("tail");
    const [showExplanation, setShowExplanation] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [videoSrcDoubleLinkedList, setVideoSrcDoubleLinkedList] = useState(DOUBLE_LINKED_LIST_API.getVideoStreamDoubleLinkedList());

       useEffect(() => {
            const interval = setInterval(() => {
                setVideoSrcDoubleLinkedList(DOUBLE_LINKED_LIST_API.getVideoStreamDoubleLinkedList());
            }, 200);
            return () => clearInterval(interval);
        });

        
        const handleInsert = async () => {
            if (!inputValue) return alert("Error: Please enter a number!");
            
            const numValue = parseInt(inputValue, 10);
            setInputValue("");
            if (isNaN(numValue) || numValue < 0 || numValue > 999) {
              return alert("Error: Number must be between 0 and 999!");
            }
            
            const result = await DOUBLE_LINKED_LIST_API.insertDoubleLinkedList(numValue, side);
                if (result.error) {
                    alert(result.error);
                } 
            
              };

          const handleDelete = async() => {
            setInputValue("");
            const result = await DOUBLE_LINKED_LIST_API.deleteDoubleLinkedList(side);
            if (result.error) {
                alert(result.error);
            } 
          };

          const handleSearch = async() => {
            if (!inputValue) return alert("Error: Please enter a number!");
            
            const numValue = parseInt(inputValue, 10);
            setInputValue("");
            if (isNaN(numValue) || numValue < 0 || numValue > 999) {
              return alert("Error: Number must be between 0 and 999!");
            }
            const result = await DOUBLE_LINKED_LIST_API.searchDoubleLinkedList(numValue, side);
            if (result.error) {
                alert(result.error);
            } 
        
          };

        const handleSwitchSide = async () => {
          if (side === "tail"){
            setSide("head")
          }
          else{
            setSide("tail")
          }

        };

         const handleReset = async () =>{
                setInputValue("");
                const result = await DOUBLE_LINKED_LIST_API.resetDoubleLinkedList();
                if (result.error) {
                    alert(result.error);
                } 
            };

    

return(
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
      <button onClick={handleSwitchSide}>{side}</button>
      <div className="pygameHeader">
        {!isImageLoaded && (
          <div className="spinner-container">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="loading">Loading Visualization...</p>
          </div>
        )}
        <img
          src={videoSrcDoubleLinkedList}
          alt="DoubleLinkedList"
          className="pygamescreen"
          style={{ display: isImageLoaded ? "block" : "none" }}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(false)}
        />
      <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>
        </div>
        <div className="resetButtonBackground">
            <button onClick = {handleReset} className="resetButton"
            >
        reset
        </button>
            </div>
          <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>DoubleLinkedList Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>*Insert Button: Add a number to the head or tail of LinkedList(you choose).</p>
          <p>*Delete Button: Remove a number from the head or tail of LinkedList(you choose).</p>
          <p>*Search Button: Search the input number in the LinkedList.</p>
          <p>*head/tail Button: Choose ths side of list you want to insert/delete node.</p>
          <p>*Reset: reset to current state.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      </div>
);
};
export default DoubleLinkedList;