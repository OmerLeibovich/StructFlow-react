import React, { useState, useEffect } from "react";
import { GRAPH_API } from "../api";

const Graph = () => {
  const [videoSrcGraph, setVideoSrcGraph] = useState(GRAPH_API.getVideoStreamGraph());
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [distances, setDistances] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [numValue, setnumValue] = useState(null);
  const [shortPaths, setshortPaths] = useState([]);
  const [data, setData] = useState({});
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    return () => {
      fetch(GRAPH_API.initGraph, { method: 'GET' })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error shutting down the server:', error));
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoSrcGraph(GRAPH_API.getVideoStreamGraph());
    }, 200);

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    const isNewSession = !sessionStorage.getItem("graphSessionActive");
    if (isNewSession) {
      localStorage.clear();
      sessionStorage.setItem("graphSessionActive", "true");
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("distances", JSON.stringify(distances));
  }, [distances]);

  useEffect(() => {
    sessionStorage.setItem("numValue", JSON.stringify(numValue));
  }, [numValue]);

  useEffect(() => {
    sessionStorage.setItem("shortPaths", JSON.stringify(shortPaths));
  }, [shortPaths]);

  useEffect(() => {
    sessionStorage.setItem("data", JSON.stringify(data));
  }, [data]);

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

  const handleMouseClick = async (e) => {
    if (e.button === 0) {
      const coords = getRelativeCoordinates(e);
      if (!coords) return;
      const { xRelative, yRelative } = coords;
      try {
        await GRAPH_API.getLeftMouseClick(xRelative, yRelative);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const sendRightMouseClick = async (phase, points) => {
    try {
      await GRAPH_API.getRightMouseClick(phase, points);
    } catch (error) {
      console.error("Error sending right mouse click", error);
    }
  };

  const handleRightMouseDown = (e) => {
    if (e.button === 2) {
      e.preventDefault();
      const coords = getRelativeCoordinates(e);
      if (coords) {
        const absX = Math.round(coords.xRelative * 700);
        const absY = Math.round(coords.yRelative * 650);
        sendRightMouseClick("start", [{ x: absX, y: absY }]);
      }
      setIsRightDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isRightDragging && dragStart) {
      const coords = getRelativeCoordinates(e);
      if (coords) {
        const absX = Math.round(coords.xRelative * 700);
        const absY = Math.round(coords.yRelative * 650);
        console.log("Dragging at:", absX, absY);
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
        sendRightMouseClick("end", { x: absX, y: absY });
      }
      setIsRightDragging(false);
      setDragStart(null);
    }
  };

  const Random_distances = async () => {
    setInputValue("");
    const result = await GRAPH_API.getLinesDistance();
    if (!result.error) setDistances(result.LinesDis);
    else alert(result.error);
  };

  const Dijkstra_Start = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const parsedValue = parseInt(inputValue, 10);
    setnumValue(parsedValue);
    setInputValue("");

    try {
      const response = await GRAPH_API.getDijkstraAlgo(parsedValue);
      if (!response) return;

      const shortestPaths = response.Shortest_paths;
      const distanceKey = response.Key_Distances;

      const weightsArray = Object.values(shortestPaths).filter(value => value !== 0);
      setshortPaths(weightsArray);

      const filteredData = Object.fromEntries(
        Object.entries(distanceKey).filter(([node]) => node !== String(parsedValue))
      );
      setData(filteredData);
      setShowTable(true);
    } catch (error) {
      console.error("Error calling Dijkstra API:", error);
    }
  };

  const resetGraph = async () => {
    setDistances([]);
    setInputValue("");
    setnumValue(null);
    setshortPaths([]);
    setData({});
    setShowTable(false);

    sessionStorage.removeItem("distances");
    sessionStorage.removeItem("numValue");
    sessionStorage.removeItem("shortPaths");
    sessionStorage.removeItem("data");
    sessionStorage.removeItem("graphSessionActive");

    await GRAPH_API.resetGraph();
  };

  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div style={{ textAlign: "center" }}>
      <input
        type="text"
        placeholder="Insert number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
      />
      <button onClick={Dijkstra_Start}>Pick a node</button>
      <button onClick={Random_distances}>Random</button>
      <h3>distances: {distances.join(", ")}</h3>
      <h3>Short_Path from {numValue}: {shortPaths.join(", ")}</h3>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {showTable && (
          <div className="TableWrapper">
            <table className="Table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([node, distance]) => (
                  <tr key={node}>
                    <td>{node}</td>
                    <td>{distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{ position: "relative", width: "700px", height: "650px" }}
          onMouseDown={(e) => {
            if (e.button === 0) handleMouseClick(e);
            else if (e.button === 2) handleRightMouseDown(e);
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <img
            src={videoSrcGraph}
            alt="Graph"
            style={{
              width: "100%",
              height: "100%",
              border: "2px solid black",
            }}
          />
        </div>
      </div>
      <div style={{ width: "600px", margin: "20px auto" }}>
        <button onClick={resetGraph} style={{ width: "100%", height: "50px", fontSize: "18px" }}>
          reset
        </button>
      </div>
    </div>
  );
};

export default Graph;
