const ArrayRect = ({ i, value, x, y, color, offset, rectRefs }) => {
  const key = `${i}`;

  return (
    <g
      key={key}
      ref={(el) => {
        if (el) rectRefs.current[key] = el;
      }}
      transform={`translate(${offset}, 0)`}
    >
      <rect
        x={x}
        y={y}
        width={60}
        height={60}
        fill={color}
        stroke="black"
        strokeWidth="2"
      />
      <text
        x={x + 30}
        y={y + 35}
        textAnchor="middle"
        fontSize="20"
        fill="black"
      >
        {value}
      </text>
    </g>
  );
};

export default ArrayRect;