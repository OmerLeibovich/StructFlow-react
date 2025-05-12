import React, { useState, useEffect, useCallback,useRef } from "react";
import { GRAPH_API } from "../api";
import { Button, Modal } from "react-bootstrap";

const Graph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dijkstraEdges, setDijkstraEdges] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedStartNode,setSelectedStartNode] = useState(null)
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [distances, setDistances] = useState([]);
  const [data, setData] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchGraphState = useCallback(async () => {
    const response = await GRAPH_API.getGraphData(); 
    setNodes(response.nodes || []);
    setEdges(response.edges || []);
    setDijkstraEdges(response.highlighted_edges || []);
  }, []);


  const isDijkstraEdge = (start, end) => {
    return dijkstraEdges.some(
      ([s, e]) =>
        (s[0] === start[0] && s[1] === start[1] && e[0] === end[0] && e[1] === end[1]) ||
        (s[0] === end[0] && s[1] === end[1] && e[0] === start[0] && e[1] === start[1])
    );
  };

  const handleClick = async (e) => {
    if (e.button === 0) {
        const { xRelative, yRelative } = getRelativeClick(e);
        const data = await GRAPH_API.getLeftMouseClick(xRelative, yRelative);
        const newNodeNum = data.nodeNumber;
        await GRAPH_API.resetRightClick();
        fetchGraphState();
        setLogs((prev) => [
            ...prev,
            <span key={prev.length}>
                Created new <strong>node{newNodeNum}</strong>
            </span>
        ]);
    }
};


const getRelativeClick = (e) => {
    return {
        xRelative: e.nativeEvent.offsetX / 700,
        yRelative: e.nativeEvent.offsetY / 650
    };
};

const handleRightClick = async (e) => {
    e.preventDefault();
    if (e.button !== 2) return;
    if (isConnecting) return;

    const { xRelative, yRelative } = getRelativeClick(e);
    const point = {
        x: Math.round(xRelative * 700),
        y: Math.round(yRelative * 650)
    };

    if (!selectedStartNode) {
        setIsConnecting(true);
        try {
            const start = await GRAPH_API.getRightMouseClick("start", [point]); 
            setSelectedStartNode(point); 
            setLogs((prev) => [
                ...prev,
                <span key={prev.length}>
                    Selected <strong>node {start.nodeNumber}</strong> as start point
                </span>
            ]);
        } finally {
            setIsConnecting(false);
        }
    } else {
       
        const threshold = 10;
        if (Math.abs(selectedStartNode.x - point.x) < threshold &&
            Math.abs(selectedStartNode.y - point.y) < threshold) {
            return;
        }

        setIsConnecting(true);
        try {
            const res = await GRAPH_API.getRightMouseClick("end", point);
            if (res?.status === "Edge added") {
                setLogs((prev) => [
                    ...prev,
                    <span key={prev.length}>
                        Connected <strong>node {res.startNumber}</strong> to <strong>node {res.endNumber}</strong>
                    </span>
                ]);
            }
            await fetchGraphState();
        } catch (error) {
            console.error("Error connecting nodes:", error);
        } finally {
            setSelectedStartNode(null);
            setIsConnecting(false);
        }
    }
};



  const Random_distances = async () => {
    setInputValue("");
    const result = await GRAPH_API.getLinesDistance();
    if (!result.error) {
      setDistances(result.LinesDis);
      fetchGraphState();
    } else {
      alert(result.error);
    }
    inputRef.current?.focus();
  };
  
  const Dijkstra_Start = async () => {
    if (!inputValue) return alert("Please enter a number!");
    const parsedValue = parseInt(inputValue, 10);
    setInputValue("");

    try {
      const response = await GRAPH_API.getDijkstraAlgo(parsedValue);
      if (!response) return;

      const distanceKey = response.Key_Distances;

      if (!distanceKey || distanceKey[String(parsedValue)] === Infinity) {
        alert("Error: this node is not connected to the graph.");
        return;
      }


      const filteredData = Object.fromEntries(
        Object.entries(distanceKey).filter(([node]) => node !== String(parsedValue))
      );
      setData(filteredData);
      setShowTable(true);
      fetchGraphState();

    } catch (error) {
      console.error("Error calling Dijkstra API:", error);
    }
    inputRef.current?.focus();
  };

  const resetGraph = async () => {
    setNodes([]);
    setEdges([]);
    setInputValue("");
    setData({});
    setShowTable(false);
    await GRAPH_API.resetGraph();
    fetchGraphState();
  };

  useEffect(() => {
    fetchGraphState();
  }, [fetchGraphState]);

  return (
    <div className="App">
      <input
        ref={inputRef}
        type="text"
        placeholder="Insert number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
      />
      <button onClick={Dijkstra_Start}>Pick a node</button>
      <button onClick={Random_distances}>Random</button>

      <h3>Distances: {distances.join(", ")}</h3>

      <div>
        {showTable && (
          <div className="TableWrapper">
            <table className="Table">
              <thead>
                <tr><th>Node</th><th>Distance</th></tr>
              </thead>
              <tbody>
                {Object.entries(data)
                  .filter(([_, dist]) => dist !== Infinity)
                  .map(([node, dist]) => (
                    <tr key={node}><td>{node}</td><td>{dist}</td></tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

                <svg
          width={700}
          height={650}
          onMouseDown={handleClick}
          onContextMenu={handleRightClick}
          style={{
            border: "1px solid black",
            background: "white",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            pointerEvents: "all",
          }}
        >
          {edges.map(([start, end, weight], index) => {
            const midX = (start[0] + end[0]) / 2;
            const midY = (start[1] + end[1]) / 2;
            return (
              <g key={index}>
                <line
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke={isDijkstraEdge(start, end) ? "red" : "black"}
                  strokeWidth={5}
                />
                {weight && (
                  <text
                    x={midX -20}
                    y={midY -20}
                    fontSize="25"
                    textAnchor="middle"
                    fill="blue"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {weight}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map(([x, y, num], index) => (
            <g key={index}>
              <circle cx={x} cy={y} r={25} fill="#ADD8E6" stroke="black" strokeWidth={2} />
              <text
                x={x}
                y={y + 5}
                fontSize="16"
                textAnchor="middle"
                fill="red"
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {num}
              </text>
            </g>
          ))}
        </svg>
                {logs.length > 0 && (
          <div className="logPanel">
            <div className="logTitle">Logs</div>
            <div className="logScroll">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
        <button className="Explanation_Button" onClick={() => setShowExplanation(true)}>
          Explanation
        </button>

        <div className="resetButtonBackground">
          <button onClick={resetGraph} className="resetButton">
            Reset
          </button>
        </div>
      </div>

      <Modal show={showExplanation} onHide={() => setShowExplanation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Graph Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>* Left click: place a node</p>
          <p>* Right click & drag: connect 2 nodes with a line</p>
          <p>* Random: assign random weights</p>
          <p>* Pick a node: run Dijkstra from that node</p>
          <p>* Reset: clears everything</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExplanation(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Graph;
