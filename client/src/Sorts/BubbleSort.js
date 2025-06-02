import { gsap } from "gsap";

export const runBubbleSort = async ({
  arrayData,
  setArrayData,
  setHighlightIndices,
  setSwappedIndices,
  setLogs,
  setSortActive,
  offsetsRef,
  forceRender,
  ARRAY_API
}) => {
  setSortActive(true);
  const result = await ARRAY_API.BubbleSort();
  const steps = result.steps;
  const finalSortedArray = result.sorted_array;

  let i = 0;
  let localArray = [...arrayData];

  const processStep = () => {
    if (i >= steps.length) {
      setHighlightIndices([]);
      setSwappedIndices([]);
      setArrayData(finalSortedArray);
      setSortActive(false);
      return;
    }

    const step = steps[i];
    const [i1, i2] = step.highlight;
    setHighlightIndices(step.highlight);
    setSwappedIndices(step.swapped ? step.highlight : []);

    const key1 = `${i1}`;
    const key2 = `${i2}`;
    const val1 = localArray[i1];
    const val2 = localArray[i2];

    if (step.swapped) {
      const dx = (i2 - i1) * (60 + 20);
      offsetsRef.current[key1] = 0;
      offsetsRef.current[key2] = 0;

      setLogs((prev) => [
        ...prev,
        <span key={prev.length}>
          <strong style={{ color: "red" }}>{val1}</strong> {'>'} from <strong style={{ color: "red" }}>{val2}</strong>
          <br />
          then: Swapped <strong style={{ color: "red" }}>{val1}</strong> and <strong style={{ color: "red" }}>{val2}</strong>
        </span>
      ]);

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
          setTimeout(processStep, 400);
        }
      });
    } else {
      setLogs((prev) => [
        ...prev,
        <span key={prev.length}>
          <strong style={{ color: "red" }}>{val1}</strong> {'<'} from <strong style={{ color: "red" }}>{val2}</strong>
          <br />
          then: we dont swap them
        </span>
      ]);
      i++;
      setTimeout(processStep, 1000);
    }
  };

  processStep();
};
