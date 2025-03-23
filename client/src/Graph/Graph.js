import React, { useState, useEffect } from "react";
import { GRAPH_API } from "../api";

const Graph = () => {
  const [videoSrcGraph, setVideoSrcGraph] = useState(
    GRAPH_API.getVideoStreamGraph()
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [distances,setDistances] = useState([]);
  // state לאיסוף נקודות במהלך גרירת לחצן ימני

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoSrcGraph(GRAPH_API.getVideoStreamGraph());
    }, 200);
    return () => clearInterval(interval);
  }, []);

 
  useEffect(() => {
    const handleWindowMouseUp = (e) => {
      if (e.button === 2) {
        setIsRightDragging(false);
        console.log("Right click drag ended (window) at:", e.clientX, e.clientY);
        setDragStart(null);
      }
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () =>
      window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [isRightDragging]);

  const getRelativeCoordinates = (e) => {
    const image = e.target;
    const imgWidth = image.offsetWidth;
    const imgHeight = image.offsetHeight;
    const imageRect = image.getBoundingClientRect();
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;
    const whiteAreaWidth = 700;
    const whiteAreaHeight = 650;
    const whiteAreaX = (imgWidth - whiteAreaWidth) / 2;
    const whiteAreaY = (imgHeight - whiteAreaHeight) / 2;

    if (
      x >= whiteAreaX &&
      x < whiteAreaX + whiteAreaWidth &&
      y >= whiteAreaY &&
      y <= whiteAreaY + whiteAreaHeight
    ) {
      return {
        xRelative: (x - whiteAreaX) / whiteAreaWidth,
        yRelative: (y - whiteAreaY) / whiteAreaHeight,
      };
    }
  };

  // טיפול בלחיצה שמאלית
  const handleMouseClick = async (e) => {
    if (e.button === 0) {
      console.log("Left click");
      const { xRelative, yRelative } = getRelativeCoordinates(e);
      try {
        const data = await GRAPH_API.getLeftMouseClick(xRelative, yRelative);
        if (data.x !== undefined && data.y !== undefined) {
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

  // פונקציה לשיגור נתוני לחצן ימני לשרת לפי השלב ("start" או "end")
  const sendRightMouseClick = async (phase, points) => {
    try {
      const data = await GRAPH_API.getRightMouseClick(phase, points);
      console.log(`Server response for ${phase}:`, data);
    } catch (error) {
      console.error("Error sending right mouse click", error);
    }
  };

  // טיפול בלחיצה ימנית (תחילת גרירה)
  const handleRightMouseDown = (e) => {
    if (e.button === 2) {
      e.preventDefault();
      const coords = getRelativeCoordinates(e);
      if (coords) {
        const absX = Math.round(coords.xRelative * 700);
        const absY = Math.round(coords.yRelative * 650);
        console.log(`Right click start absolute coordinates: x=${absX}, y=${absY}`);
        // שליחת הנתונים כשלב התחלה
        sendRightMouseClick("start", [{ x: absX, y: absY }]);
        // אתחול מערך הנקודות עם נקודת התחלה
      } else {
        console.log("Right click start: Click was outside the white area.");
      }
      setIsRightDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      console.log("Right click drag started", e.clientX, e.clientY);
    }
  };

  // טיפול בתנועת העכבר בעת גרירה
  const handleMouseMove = (e) => {
    if (isRightDragging && dragStart) {
      const coords = getRelativeCoordinates(e);
      if (coords) {
        const absX = Math.round(coords.xRelative * 700);
        const absY = Math.round(coords.yRelative * 650);
        console.log("Dragging at absolute coordinates:", absX, absY);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 2 && isRightDragging) {
      e.preventDefault();
      const coords = getRelativeCoordinates(e);
      if (coords) {
        const absX = Math.round(coords.xRelative * 700);
        const absY = Math.round(coords.yRelative * 650);
        console.log(`Right click end absolute coordinates: x=${absX}, y=${absY}`);
        sendRightMouseClick("end", { x: absX, y: absY });
      }
      setIsRightDragging(false);
      setDragStart(null);
    }
  };

  const Random_distances = async () => {
    const result = await GRAPH_API.getLinesDistance();
    if (!result.error) {
      setDistances(result.LinesDis)
    }
    else {
      alert(result.error);
    }


  };

  // מניעת תפריט הקשר
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
       <button onClick={Random_distances}>Random</button>
       <h3>distances: {distances.join(", ")}</h3>
      <div
        style={{ marginTop: "20px" }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            handleMouseClick(e);
          } else if (e.button === 2) {
            handleRightMouseDown(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <img
          src={videoSrcGraph}
          alt="Graph"
          style={{
            width: "700px",
            height: "650px",
            border: "2px solid black",
          }}
        />
      </div>
      <p>
        Mouse Position: {`x: ${mousePosition.x}, y: ${mousePosition.y}`}
      </p>
    </div>
  );
};

export default Graph;
