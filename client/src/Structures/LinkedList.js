import React, {useState,useEffect} from "react";
import "../App.css";
import { Button, Modal,Spinner } from "react-bootstrap";
import { LINKED_LIST_API } from "../api"; 

const LinkedList = () =>{
    const [inputValue, setInputValue] = useState("");
    const [showExplanation, setShowExplanation] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [videoSrcLinkedList, setVideoSrcLinkedList] = useState(LINKED_LIST_API.getVideoStreamLinkedList());


      useEffect(() => {
        const interval = setInterval(() => {
            setVideoSrcLinkedList(LINKED_LIST_API.getVideoStreamLinkedList());
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
    
        const result = await LINKED_LIST_API.insertLinkedList(numValue);
        if (result.error) {
            alert(result.error);
        } 
    
      };
    const handleDelete = async () =>{
        setInputValue("");
        const result = await LINKED_LIST_API.deleteLinkedList();
        if (result.error) {
            alert(result.error);
        } 

    }
    const handleSearch = async () => {
        if (!inputValue) return alert("Error: Please enter a number!");
    
        const numValue = parseInt(inputValue, 10);
        setInputValue("");
        if (isNaN(numValue) || numValue < 0 || numValue > 999) {
          return alert("Error: Number must be between 0 and 999!");
        }
    
        const result = await LINKED_LIST_API.searchLinkedList(numValue);
        if (result.error) {
            alert(result.error);
        } 
    
      };
    const handleReset = async () =>{
        setInputValue("");
        const result = await LINKED_LIST_API.resetLinkedList();
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
      <div className="pygameHeader">
        {!isImageLoaded && (
          <div className="spinner-container">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="loading">Loading Visualization...</p>
          </div>
        )}
        <img
          src={videoSrcLinkedList}
          alt="LinkedList"
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
          <Modal.Title>LinkedList Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>*Insert Button: Add a number to the LinkedList.</p>
          <p>*Delete Button: Remove a number from the tail of LinkedList.</p>
          <p>*Search Button: Search the input number in the LinkedList.</p>
          <p>*Reset: reset to current state.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      </div>

);
};
export default LinkedList;