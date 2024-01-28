import React from "react";
import {Html} from "@react-three/drei";

const NavigationArrows = React.memo(({ onPrevClick, onNextClick }) => {
    const buttonStyle = {
        background: "rgba(255, 255, 255, 0.5)",
        color: "black",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: "pointer",
        margin: "0 46px 0 36px",
        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
    };

    const containerStyle = {
        position: "absolute",
        top: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    };

    return (
        <Html>
            <div style={containerStyle}>
                <button style={buttonStyle} onClick={onPrevClick}>&lt;</button>
                <button style={buttonStyle} onClick={onNextClick}>&gt;</button>
            </div>
        </Html>
    );
});
export default NavigationArrows;