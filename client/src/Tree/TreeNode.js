// client/Components/ArrayNode.js
import React from "react";

const TreeCircle = React.forwardRef(({ i, value, x, y, color, offset }, ref) => {
  const radius = 30; 

  return (
    <g ref={ref} className="TreeCircle" transform={`translate(${offset}, 0)`}>
      <circle
        cx={x + radius}
        cy={y + radius}
        r={radius}
        fill={color || "grey"}
        stroke="black"
        strokeWidth="2"
      />
      <text
        x={x + radius}
        y={y + radius + 6} 
        textAnchor="middle"
        fontSize="20"
        fill="black"
      >
        {value}
      </text>
    </g>
  );
});

export default TreeCircle;
