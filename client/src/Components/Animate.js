import gsap from "gsap";

export const animateTraversal = async (
  path,
  setHighlightsNodes,
  nodeRefs,
  replacement = null,
  isInsert = false
) => {
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    setHighlightsNodes([{ key: node, color: isInsert ? "green" : "red" }]);

    const ref = nodeRefs.current[node];
    if (ref?.current) {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut"
        }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  if (replacement) {
    setHighlightsNodes(
      path.map((n) =>
        n === replacement
          ? { key: n, color: "green" }
          : { key: n, color: "red" }
      )
    );
  } else if (isInsert) {
    setHighlightsNodes(path.map((n) => ({ key: n, color: "green" })));
  } else {
    setHighlightsNodes(path.map((n) => ({ key: n, color: "red" })));
  }
};


export const animateNodeMovements = (
  treeData,
  prevPositions,
  setPrevPositions,
  nodeRefs,
  getNodePositions
) => {
  if (!treeData || !prevPositions) return;

  const currentPositions = getNodePositions(treeData, 500, 80);

  for (const key in currentPositions) {
    const ref = nodeRefs.current[key];
    const prev = prevPositions[key];
    const current = currentPositions[key];

    if (ref?.current && prev && (prev.x !== current.x || prev.y !== current.y)) {
      gsap.fromTo(
        ref.current,
        { x: prev.x - current.x, y: prev.y - current.y },
        { x: 0, y: 0, duration: 1.2, ease: "power2.out" }
      );
    }
  }

  setPrevPositions(currentPositions);
};