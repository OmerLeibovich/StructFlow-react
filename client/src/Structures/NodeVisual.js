import React from "react";

const NodeVisual = ({ node }) => {
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r={25}
        fill={node.search ? "red" : node.highlight ? "green" : "blue"}
        stroke="black"
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={node.y + 5}
        textAnchor="middle"
        fontSize="16"
        fill="white"
      >
        {node.value}
      </text>
    </g>
  );
};

export default NodeVisual;