import React, { useState, useEffect } from "react";
import { GRAPH_API } from "../api";

const Graph = () => {
  const [videoSrcGraph, setVideoSrcGraph] = useState(
    GRAPH_API.getVideoStreamGraph()
  );
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [distances,setDistances] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [numValue, setnumValue] = useState();
  const [shortPaths,setshortPaths] = useState([]);
  const [data,setData] = useState({});



  // const columns = [
  //   { field: 'id', headerName: 'ID', width: 70 },
  //   { field: 'firstName', headerName: 'First name', width: 130 },
  //   { field: 'lastName', headerName: 'Last name', width: 130 },
  //   {
  //     field: 'age',
  //     headerName: 'Age',
  //     type: 'number',
  //     width: 90,
  //   },
  //   {
  //     field: 'fullName',
  //     headerName: 'Full name',
  //     description: 'This column has a value getter and is not sortable.',
  //     sortable: false,
  //     width: 160,
  //     valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  //   },
  // ];
  
  // const rows = [
  //   { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  //   { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  //   { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  //   { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  //   { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  //   { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  //   { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  //   { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  //   { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  // ];
  
  // const paginationModel = { page: 0, pageSize: 5 };
  
  


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

  const handleMouseClick = async (e) => {
    if (e.button === 0) {
      console.log("Left click");
      const coords = getRelativeCoordinates(e);
      
      if (!coords) {
        console.log("Click is outside the white area.");
        return;
      }
  
      const { xRelative, yRelative } = coords;
  
      try {
        const data = await GRAPH_API.getLeftMouseClick(xRelative, yRelative);
        if (data.x !== undefined && data.y !== undefined) {
          // Handle the click response if needed
        } else {
          console.error("Error: Missing x or y in response");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };


  const sendRightMouseClick = async (phase, points) => {
    try {
      const data = await GRAPH_API.getRightMouseClick(phase, points);
      console.log(`Server response for ${phase}:`, data);
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
        console.log(`Right click start absolute coordinates: x=${absX}, y=${absY}`);
        sendRightMouseClick("start", [{ x: absX, y: absY }]);
      } else {
        console.log("Right click start: Click was outside the white area.");
      }
      setIsRightDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      console.log("Right click drag started", e.clientX, e.clientY);
    }
  };

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
    setInputValue("");
    const result = await GRAPH_API.getLinesDistance();
    if (!result.error) {
      setDistances(result.LinesDis)
    }
    else {
      alert(result.error);
    }


  };
  const Dijkstra_Start = async () => {
    const parsedValue = parseInt(inputValue, 10);
    setnumValue(parsedValue); 
    setInputValue("");
    try {
      const response = await GRAPH_API.getDijkstraAlgo(parsedValue);
      console.log("Full response:", response);
      if (!response) {
        console.error("No response data received", response);
        return;
      }
      
      
      const shortestPaths = response.Shortest_paths;
      const previousNodes = response.Previous_nodes;
      const distanceKey = response.Key_Distances;
      const weightsArray = Object.values(shortestPaths);
      setshortPaths(weightsArray);
      const filteredData = Object.fromEntries(
        Object.entries(distanceKey).filter(([node, distance]) => node !== inputValue)
      );
      setData(filteredData);
      
      
      console.log("Shortest Paths:", shortestPaths);
      console.log("Previous Nodes:", previousNodes);
    } catch (error) {
      console.error("Error calling Dijkstra API:", error);
    }
  };
  

  const resetGraph = async () => {
      setInputValue("");
      await GRAPH_API.resetGraph();
  }
  
  
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ textAlign: "center"}}>
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
        <div style={{display: "flex", justifyContent: "center" }}>
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
      <div
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
      </div>
      <div style={{ width: "600px", margin: "20px auto" }}>
            <button onClick = {resetGraph} style={{ width: "100%", height: "50px", fontSize: "18px" }}>
            reset
        </button>
            </div>
    </div>
  );
};

export default Graph;
