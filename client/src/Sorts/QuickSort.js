import { gsap } from "gsap";

export const runQuickSort = async ({
  arrayData,
  setArrayData,
  setHighlightIndices,
  setSwappedIndices,
  setLogs,
  setSortActive,
  offsetsRef,
  forceRender,
  ARRAY_API,
}) => {
  setSortActive(true);

  const result = await ARRAY_API.QuickSort();
  const steps = result.steps;
  const finalSortedArray = result.sorted_array;

  let i = 0;
  let localArray = [...arrayData];

  const processStep = () => {
    if (i >= steps.length) {
      setHighlightIndices([]);
      setSwappedIndices([]);
      setArrayData([...finalSortedArray]);
      setSortActive(false);
      return;
    }

    const step = steps[i];
    const [i1, i2] = step.highlight;
    const [val1, val2] = step.values || [localArray[i1], localArray[i2]];
    const { comparison, swapped } = step;

    setHighlightIndices(step.highlight);
    setSwappedIndices(swapped ? step.highlight : []);

    const key1 = `${i1}`;
    const key2 = `${i2}`;
    offsetsRef.current[key1] = 0;
    offsetsRef.current[key2] = 0;

   const logEntry = (
    <span key={i} style={{ lineHeight: "1.6" }}>
        {comparison && (
        <>
            <strong>Pivot:</strong> {val2} (index {i2})<br />
            <strong>Comparing:</strong> {val1} (index {i1}) with pivot<br />
        </>
        )}

        {comparison?.includes("True") && !swapped ? (
        <>
            Result: {val1} is smaller than the pivot, but it's already in the correct place. No swap needed.
        </>
        ) : comparison?.includes("True") && swapped ? (
        <>
            Result: {val1} is smaller than the pivot. Swapped positions {i1} and {i2}.
        </>
        ) : comparison?.includes("False") ? (
        <>
            Result: {val1} is not smaller than the pivot. No swap performed.
        </>
        ) : swapped ? (
        <>
            Swapped values at indices {i1} and {i2} to place the pivot in its correct position.
        </>
        ) : (
        <>
            No swap was needed.
        </>
        )}
    </span>
    );


    setLogs(prev => [...prev, logEntry]);

    if (swapped) {
      const dx = (i2 - i1) * 80;

      gsap.to(offsetsRef.current, {
        [key1]: dx,
        [key2]: -dx,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: forceRender,
        onComplete: () => {
          [localArray[i1], localArray[i2]] = [localArray[i2], localArray[i1]];
          setArrayData([...localArray]);
          offsetsRef.current[key1] = 0;
          offsetsRef.current[key2] = 0;
          forceRender();
          i++;
          setTimeout(processStep, 1000);
        }
      });
    } else {
      i++;
      setTimeout(processStep, 1500);
    }
  };

  processStep();
};
