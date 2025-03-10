import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

const columns = 25;
const rows = 25;
let grid = [];
let queue = [];
let path = [];
let startBox, targetBox, searching = false;

const PathFinder = () => {
    const canvasRef = useRef();
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        new p5(sketch, canvasRef.current);
    }, []);

    const sketch = (p) => {
        let boxWidth, boxHeight;

        p.setup = () => {
            p.createCanvas(600, 600).parent(canvasRef.current);
            boxWidth = p.width / columns;
            boxHeight = p.height / rows;

            // יצירת גריד
            for (let i = 0; i < columns; i++) {
                grid[i] = [];
                for (let j = 0; j < rows; j++) {
                    grid[i][j] = new Box(i, j);
                }
            }

            // הגדרת שכנים
            for (let i = 0; i < columns; i++) {
                for (let j = 0; j < rows; j++) {
                    grid[i][j].setNeighbours();
                }
            }

            // הגדרת נקודת התחלה אקראית
            startBox = grid[Math.floor(Math.random() * columns)][Math.floor(Math.random() * rows)];
            startBox.start = true;
            startBox.visited = true;
            queue.push(startBox);
        };

        p.draw = () => {
            p.background(0);

            // ציור הגריד
            for (let i = 0; i < columns; i++) {
                for (let j = 0; j < rows; j++) {
                    grid[i][j].show(p, boxWidth, boxHeight);
                }
            }

            // אלגוריתם חיפוש
            if (gameStarted && queue.length > 0) {
                let currentBox = queue.shift();
                currentBox.visited = true;

                if (currentBox === targetBox) {
                    searching = false;
                    let temp = currentBox;
                    while (temp.prior !== startBox) {
                        path.push(temp.prior);
                        temp = temp.prior;
                    }
                } else {
                    for (let neighbor of currentBox.neighbours) {
                        if (!neighbor.queued && !neighbor.wall) {
                            neighbor.queued = true;
                            neighbor.prior = currentBox;
                            queue.push(neighbor);
                        }
                    }
                }
            } else if (gameStarted) {
                alert("אין פתרון!");
                setGameStarted(false);
            }
        };

        p.mousePressed = () => {
            let x = Math.floor(p.mouseX / boxWidth);
            let y = Math.floor(p.mouseY / boxHeight);
            if (x >= 0 && x < columns && y >= 0 && y < rows) {
                if (p.mouseButton === p.LEFT) {
                    grid[x][y].wall = true;
                } else if (p.mouseButton === p.RIGHT && !targetBox) {
                    targetBox = grid[x][y];
                    targetBox.target = true;
                }
            }
        };
    };

    const startGame = () => {
        if (targetBox) {
            setGameStarted(true);
        } else {
            alert("יש לבחור נקודת יעד לפני תחילת המשחק!");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1 style={{ color: "white" }}>Path Finder</h1>
            <div ref={canvasRef}></div>
            <button 
                onClick={startGame} 
                style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>
                הפעל חיפוש 🔍
            </button>
        </div>
    );
};

// מחלקת ה"בלוק"
class Box {
    constructor(i, j) {
        this.x = i;
        this.y = j;
        this.start = false;
        this.wall = false;
        this.target = false;
        this.queued = false;
        this.visited = false;
        this.neighbours = [];
        this.prior = null;
    }

    show(p, boxWidth, boxHeight) {
        let col = p.color(100);
        if (this.queued) col = p.color(200, 0, 0);
        if (this.visited) col = p.color(0, 200, 0);
        if (path.includes(this)) col = p.color(0, 0, 200);
        if (this.start) col = p.color(0, 200, 200);
        if (this.wall) col = p.color(10, 10, 10);
        if (this.target) col = p.color(200, 200, 0);

        p.fill(col);
        p.stroke(50);
        p.rect(this.x * boxWidth, this.y * boxHeight, boxWidth - 2, boxHeight - 2);
    }

    setNeighbours() {
        if (this.x > 0) this.neighbours.push(grid[this.x - 1][this.y]);
        if (this.x < columns - 1) this.neighbours.push(grid[this.x + 1][this.y]);
        if (this.y > 0) this.neighbours.push(grid[this.x][this.y - 1]);
        if (this.y < rows - 1) this.neighbours.push(grid[this.x][this.y + 1]);
    }
}

export default PathFinder;
