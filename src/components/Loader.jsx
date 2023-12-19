import React from "react";
import { Html, useProgress } from "@react-three/drei";
import "../CanvasLoader.css"; // Используйте путь к вашему CSS-файлу

const CanvasLoader = () => {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="sneaker">
                <div className="sole"></div>
                <div className="laces"></div>
                <div className="eyelet left"></div>
                <div className="eyelet right"></div>
            </div>
            <p className="progress-text">{progress.toFixed(2)}%</p>
        </Html>
    );
};

export default CanvasLoader;
