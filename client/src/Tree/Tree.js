import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // ייבוא של useNavigate
import AVLTree from "../Components/PygameViewer";

function Tree({ setShow }) {
  const navigate = useNavigate(); // יצירת פונקציה לניווט

  const handleBack = () => {
    setShow({ AVL_Tree: false, main: false, tree: false }); // מחזיר את ה-state לדף הראשי
    navigate('/'); // ניווט לדף הראשי
  };
  return (
    <div>
      {/* כפתור חזרה בצד שמאל למעלה */}
      <Button 
        variant="secondary" 
        style={{ position: 'absolute', top: '10px', left: '10px' }} 
        onClick={handleBack}   // ניווט לדף הראשי
      >
        חזרה
      </Button>

      <AVLTree />
    </div>
  );
}

export default Tree;
