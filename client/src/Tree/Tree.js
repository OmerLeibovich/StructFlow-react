import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AVLTree from "../Components/PygameViewer";

function Tree({ setShow }) {
  const location = useLocation(); // ✅ בודק לאיזה דף המשתמש נכנס

  useEffect(() => {
    // ✅ שומר נתונים רק אם המשתמש עשה רענון
    sessionStorage.setItem("treeSessionActive", "true"); 

    return () => {
      if (sessionStorage.getItem("treeSessionActive")) {
        localStorage.clear();
        sessionStorage.removeItem("treeSessionActive");
        setShow({ AVL_Tree: false, main: false, tree: false, sorts: false, graph: false, structures: false });
      }
    };
  }, [location.pathname]); 

  return (
    <div>
      <AVLTree />
    </div>
  );
}

export default Tree;
