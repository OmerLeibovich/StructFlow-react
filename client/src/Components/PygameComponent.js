import React, { useEffect, useRef } from "react";

const PygameComponent = () => {
  const pyodideRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadPyodideAndRun = async () => {
      if (!pyodideRef.current) {
        pyodideRef.current = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
      }

      await pyodideRef.current.loadPackage(["pygame"]);

      pyodideRef.current.runPython(pygameScript);
    };

    loadPyodideAndRun();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "white" }}>משחק Pygame בתוך React</h2>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default PygameComponent;
