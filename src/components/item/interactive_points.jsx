import React from "react";
import {useFrame} from "@react-three/fiber";
import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";

const ShoesModelContent = React.memo(({ camera, loadedModel, isMobile, scaleFactor, interactivePoints }) => {
    const updateInteractivePointsRotation = () => {
        interactivePoints.forEach((point) => {
            if (point.ref.current && camera.current) {
                const { x, y, z } = camera.current.position;
                point.ref.current.lookAt(x, y, z);
                const angle = Math.abs(camera.current.position.angleTo(point.ref.current.position));
                const newOpacity = angle > Math.PI / 2 ? 0.7 : 1;
                point.ref.current.material.opacity = newOpacity;
            }
        });
    };

    useFrame(() => {
        updateInteractivePointsRotation();
        TWEEN.update();
    });

    return (
        <group>
            <mesh>
                <primitive object={loadedModel} rotation={[-0.01, 1.5, -0.1]} position={[0, 0, 0]} />
            </mesh>
            {interactivePoints.map((point, index) => (
                <mesh
                    key={index}
                    ref={point.ref}
                    onClick={() => point.onClick(index)}
                    position={point.position}
                    scale={0.01}
                    material-roughness={1}
                    castShadow
                    receiveShadow
                >
                    <circleGeometry args={[1, 32]} attach="geometry" />
                    <meshBasicMaterial
                        attach="material"
                        transparent
                        opacity={0.8}
                        depthTest={false}
                    >
                        <primitive
                            attach="map"
                            object={new THREE.TextureLoader().load("/point.png")}
                        />
                    </meshBasicMaterial>
                </mesh>
            ))}
        </group>
    );
});
export default ShoesModelContent;