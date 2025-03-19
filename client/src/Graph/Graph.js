import React, { useState, useEffect } from "react";
import { GRAPH_API } from "../api";

const Graph = () => {
  const [videoSrcGraph, setVideoSrcGraph] = useState(GRAPH_API.getVideoStreamGraph());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoSrcGraph(GRAPH_API.getVideoStreamGraph());
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleMouseClick = async (e) => {
    // Get the image element from the event target
    const image = e.target;
    
    // Get the image dimensions (width and height)
    const imgWidth = image.offsetWidth;
    const imgHeight = image.offsetHeight;
  
    // Get the image's position relative to the viewport
    const imageRect = image.getBoundingClientRect();
  
    // Calculate the click coordinates relative to the image
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;
  
    // Define the white area's dimensions and position (assuming it is centered in the image)
    const whiteAreaWidth = 700;  // White area width
    const whiteAreaHeight = 650; // White area height
    const whiteAreaX = (imgWidth - whiteAreaWidth) / 2; // X coordinate of the white area's top-left corner
    const whiteAreaY = (imgHeight - whiteAreaHeight) / 2; // Y coordinate of the white area's top-left corner
  
    // Check if the click is within the white area boundaries
    if (
      x >= whiteAreaX &&
      x < whiteAreaX + whiteAreaWidth &&
      y >= whiteAreaY &&
      y <= whiteAreaY + whiteAreaHeight
    ) {
      // Calculate relative coordinates (between 0 and 1) within the white area
      const xRelative = (x - whiteAreaX) / whiteAreaWidth;
      const yRelative = (y - whiteAreaY) / whiteAreaHeight;
  
      try {
        // Send the relative coordinates to your API
        const data = await GRAPH_API.getMouseClick(xRelative, yRelative);
  
        if (data.x !== undefined && data.y !== undefined) {
          // Update the mouse position state with the response
          setMousePosition({ x: data.x, y: data.y });
        } else {
          console.error("Error: Missing x or y in response");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("Click is outside the white area.");
    }
  };
  
  
  
  

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div style={{ marginTop: "20px" }} onClick={handleMouseClick}>
        <img
          src={videoSrcGraph}
          alt="Graph"
          style={{ width: "700px", height: "650px", border: "2px solid black" }}
        />
      </div>
      <p>
          Mouse Position: {`x: ${mousePosition.x}, y: ${mousePosition.y}`}
        </p>
    </div>
  );
};

export default Graph;
