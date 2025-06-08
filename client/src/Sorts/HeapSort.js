// import { gsap } from "gsap";

// export const runHeapSort = async ({
//   arrayData,
//   setArrayData,
//   setHighlightIndices,
//   setSwappedIndices,
//   setLogs,
//   setSortActive,
//   offsetsRef,
//   forceRender,
//   ARRAY_API
// }) => {
//   setSortActive(true);
//   const result = await ARRAY_API.HeapSort(); 
//   const steps = result.steps;
//   const finalSortedArray = result.sorted_array;

//   // סנכרון המערך ההתחלתי עם המצב מהשרת
//   let i = 0;
//   let localArray = steps.length > 0 ? [...steps[0].array] : [...arrayData];
//   setArrayData([...localArray]);

//   const processStep = () => {
//     if (i >= steps.length) {
//       setHighlightIndices([]);
//       setSwappedIndices([]);
//       setArrayData(finalSortedArray);
//       setSortActive(false);
//       return;
//     }

//     const step = steps[i];
//     const highlight = step.highlight;
//     const swapped = step.swapped;

//     setHighlightIndices(highlight);
//     setSwappedIndices(swapped ? highlight : []);

//     const i1 = highlight[0];
//     const i2 = highlight.length > 1 ? highlight[1] : null;
//     const val1 = localArray[i1];
//     const val2 = i2 !== null ? localArray[i2] : null;

//     // סינון חילופים מיותרים (אם הערכים שווים)
//     if (swapped && i2 !== null && val1 === val2) {
//       i++;
//       setTimeout(processStep, 300);
//       return;
//     }

//     if (swapped && i2 !== null) {
//       const dx = (i2 - i1) * (60 + 20);
//       const key1 = `${i1}`;
//       const key2 = `${i2}`;
//       offsetsRef.current[key1] = 0;
//       offsetsRef.current[key2] = 0;

//       setLogs((prev) => [
//         ...prev,
//         <span key={prev.length}>
//           <strong style={{ color: "red" }}>{val1}</strong> swapped with <strong style={{ color: "red" }}>{val2}</strong>
//         </span>
//       ]);

//       gsap.to(offsetsRef.current, {
//         [key1]: dx,
//         [key2]: -dx,
//         duration: 1.5,
//         ease: "power2.inOut",
//         onUpdate: forceRender,
//         onComplete: () => {
//           [localArray[i1], localArray[i2]] = [localArray[i2], localArray[i1]];
//           setArrayData([...localArray]);
//           offsetsRef.current[key1] = 0;
//           offsetsRef.current[key2] = 0;
//           forceRender();
//           i++;
//           setTimeout(processStep, 400);
//         }
//       });
//     } else {
//       setLogs((prev) => [
//         ...prev,
//         <span key={prev.length}>
//           Checked <strong>{val1}</strong> but no swap needed
//         </span>
//       ]);
//       i++;
//       setTimeout(processStep, 800);
//     }
//   };

//   processStep();
// };
