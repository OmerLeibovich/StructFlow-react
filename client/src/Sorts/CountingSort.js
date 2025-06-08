export const runCountingSort = async ({
  arrayData,
  setArrayData,
  setHighlightIndices,
  setLogs,
  setSortActive,
  setCountArray,
  ARRAY_API,
}) => {
  setSortActive(true);

  const result = await ARRAY_API.CountingSort(); 
  const steps = result.steps;
  const finalSortedArray = result.sorted_array;

  let i = 0;

  const processStep = () => {
    if (i >= steps.length) {
      setHighlightIndices([]);
      setArrayData([...finalSortedArray]);
      setSortActive(false);
      setCountArray([]); 
      return;
    }

    const step = steps[i];
    const { highlight, description, array, count_array } = step;


    setHighlightIndices(highlight || []);
    setLogs((prev) => [
      ...prev,
      <span key={prev.length}>{description}</span>,
    ]);

 
    setArrayData([...array]);

     if (count_array) {
      setCountArray([...count_array]);
    }

    i++;
    setTimeout(processStep, 2000); 
  };

  processStep();
};
