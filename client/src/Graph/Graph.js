import React, { useState, useEffect, useCallback } from "react";
import { GRAPH_API } from "../api";
import { Button, Modal } from "react-bootstrap";

const Graph = () => {
  
  const [videoSrcGraph, setVideoSrcGraph] = useState(GRAPH_API.getVideoStreamGraph());
  const [inputValue, setInputValue] = useState("");
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [distances, setDistances] = useState(() => {
    const saved = localStorage.getItem("distances");
    return saved ? JSON.parse(saved) : [];
  });
  const [numValue, setNumValue] = useState(() => {
    const saved = localStorage.getItem("numValue");
    return saved ? JSON.parse(saved) : null;
  });

  const [shortPaths, setShortPaths] = useState(() => {
    const saved = localStorage.getItem("shortPaths");
    return saved ? JSON.parse(saved) : [];
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("data");
    return saved ? JSON.parse(saved) : {};
  });

  const [showTable, setShowTable] = useState(() => {
    const saved = localStorage.getItem("showTable");
    return saved ? JSON.parse(saved) : false;
  });


  useEffect(() => {
    const savedDistances = localStorage.getItem("distances");
    const savedNumValue = localStorage.getItem("numValue");
    const savedShortPaths = localStorage.getItem("shortPaths");
    const savedData = localStorage.getItem("data");
    const savedShowTable = localStorage.getItem("showTable");
  
    if (savedDistances) setDistances(JSON.parse(savedDistances));
    if (savedNumValue) setNumValue(JSON.parse(savedNumValue));
    if (savedShortPaths) setShortPaths(JSON.parse(savedShortPaths));
    if (savedData) setData(JSON.parse(savedData));
    if (savedShowTable) setShowTable(JSON.parse(savedShowTable));
  }, []);
  


  useEffect(() => {
    const interval = setInterval(() => {
      setVideoSrcGraph(GRAPH_API.getVideoStreamGraph());
    }, 200);
    return () => clearInterval(interval);
  }, []);

 
  const fetchGraphData = useCallback(async () => {
    const graphData = await GRAPH_API.getgraph();
    if (graphData && graphData.distanses) {
      setDistances(graphData.distanses);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  
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

  const handleContextMenu = (e) => e.preventDefault();

  const Random_distances = async () => {
    setInputValue("");
    const result = await GRAPH_API.getLinesDistance();
    if (!result.error) {
      setDistances(result.LinesDis);
    } else {
      alert(result.error);
    }
  };

  const Dijkstra_Start = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const parsedValue = parseInt(inputValue, 10);
    setInputValue("");

    try {
      const response = await GRAPH_API.getDijkstraAlgo(parsedValue);
      if (!response) return;

      const shortestPaths = response.Shortest_paths;
      const distanceKey = response.Key_Distances;

      if (!distanceKey || !distanceKey.hasOwnProperty(parsedValue)) {
        alert("Error: this number not in the graph!");
        return;
      }

      setNumValue(parsedValue);

      const weightsArray = Object.values(shortestPaths).filter(value => value !== 0);
      setShortPaths(weightsArray);

  
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
    setNumValue(null);
    setShortPaths([]);
    setData({});
    setShowTable(false);

  
    localStorage.removeItem("distances");
    localStorage.removeItem("numValue");
    localStorage.removeItem("shortPaths");
    localStorage.removeItem("data");
    localStorage.removeItem("showTable");




    await GRAPH_API.resetGraph();
  };

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
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>

      </div>

      <div style={{ width: "600px", margin: "20px auto" }}>
        <button onClick={resetGraph} style={{ width: "100%", height: "50px", fontSize: "18px" }}>
          reset
        </button>
      </div>


      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Graph Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>*Left click mouse: choose place to put node.</p>
          <p>*Right click mouse: hold to connect 2 nodes with line.</p>
          <p>*Random Button: give random distances to lines.</p>
          <p>*Pick a node Button: get all distance from any node to the chosen node.</p>
          <p>*Reset: reset all the screen.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Graph;
