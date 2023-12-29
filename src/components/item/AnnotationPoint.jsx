import React from "react";
import { Html } from "@react-three/drei";

const AnnotationPoint = ({ position, onClick }) => {
    return (
        <mesh position={position} onClick={onClick}>
            <boxBufferGeometry attach="geometry" args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial attach="material" color="red" />
            <Html>
                <div style={{ color: "red", fontSize: "12px", textAlign: "center" }}>
                    This is a point
                </div>
            </Html>
        </mesh>
    );
};

export default AnnotationPoint;
