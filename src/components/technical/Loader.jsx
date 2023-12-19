import React from "react";
import { Html, useProgress } from "@react-three/drei";
import "./CanvasLoader.css";

const CanvasLoader = () => {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="loader-container">
                <div className="loader-ring"></div>
                <p className="progress-text">{progress.toFixed(2)}%</p>
            </div>
        </Html>
    );
};

export default CanvasLoader;
