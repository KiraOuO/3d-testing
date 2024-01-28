import React from "react";
import {Html} from "@react-three/drei";

const ResetButton = React.memo(({ onClick }) => {
    return (
        <Html>
            <div
                style={{
                    position: "absolute",
                    top: "400px",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    zIndex: "999",
                }}>
                <button
                    onClick={onClick}
                    style={{
                        padding: "8px 16px",
                        background: "rgba(255, 255, 255, 0.5)",
                        color: "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        outline: "none",
                        marginRight: "10px",
                        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
                        zIndex: "999",
                    }}
                >
                    Reset
                </button>
            </div>
        </Html>
    );
});
export default ResetButton;
