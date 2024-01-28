import React from "react";
import { Html } from "@react-three/drei";

const TextBlock = ({ showText, text, textBlockRef }) => {
    return (
        showText && (
            <Html>
                <div
                    ref={textBlockRef}
                    className={showText.toString()}
                    style={{
                        fontSize: "24px",
                        textAlign: "start",
                        padding: "20px",
                        width: "300px",
                        position: "absolute",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        zIndex: 999,
                        textShadow: "0 0 10px rgba(255,255,255,0.8)",
                        opacity: 0,
                    }}>
                    {text}
                </div>
            </Html>
        )
    );
};

export default TextBlock;
