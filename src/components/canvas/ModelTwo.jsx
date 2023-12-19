import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader.jsx";

const Shoetwo = ({ isMobile, resetPosition }) => {
    const { scene: modeloneScene } = useGLTF("./desktop_pc/test.gltf");
    const spotLightRef = useRef();
    const lastInteractionTime = useRef(Date.now());
    const modelRef = useRef();

    useFrame(({ clock, camera }) => {
        // Dynamic positioning of the light
        if (spotLightRef.current) {
            const time = clock.getElapsedTime();
            const radius = 20;
            const x = Math.cos(time) * radius;
            const y = Math.sin(time) * radius;
            spotLightRef.current.position.set(x, y, 10);
        }

        // Check for inactivity and reset position
        const currentTime = Date.now();
        if (currentTime - lastInteractionTime.current > 5000) {
            resetPosition();
            lastInteractionTime.current = currentTime;
        }

        // Update the position of the model based on the camera
        if (modelRef.current) {
            const { position, rotation } = camera;
            const speed = 0.01;
            modelRef.current.position.x = position.x * speed;
            modelRef.current.position.y = position.y * speed;
            modelRef.current.position.z = position.z * speed;
            modelRef.current.rotation.x = rotation.x;
            modelRef.current.rotation.y = rotation.y;
            modelRef.current.rotation.z = rotation.z;
        }
    });

    return (
        <group ref={modelRef}>
            <hemisphereLight intensity={2.55} />

            <spotLight
                ref={spotLightRef}
                angle={1.12}
                penumbra={1}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={100}
            />

            <pointLight intensity={0.05} />

            <primitive
                object={modeloneScene}
                scale={isMobile ? [0.01, 0.01, 0.01] : [0.02, 0.02, 0.02]}
                position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
                rotation={[-0.01, -0.2, -0.1]}
                castShadow
                position={[0.5, 0.5, 1.2]} // Initial position
            />
        </group>
    );
};

const ModelTwo = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [resetPosition, setResetPosition] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 500px)");
        setIsMobile(mediaQuery.matches);

        const handleMediaQueryChange = (event) => {
            setIsMobile(event.matches);
        };

        mediaQuery.addEventListener("change", handleMediaQueryChange);

        return () => {
            mediaQuery.removeEventListener("change", handleMediaQueryChange);
        };
    }, []);

    const handleInteraction = () => {
        // User interacts, cancel the reset timer
        setResetPosition(false);
    };

    const handleResetPosition = () => {
        // Reset position
        setResetPosition(true);
    };

    return (
        <Canvas
            frameloop="demand"
            shadows
            dpr={[1, 2]}
            camera={{ position: [23, 3, 5], fov: 105, near: 1, far: 10000 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <Suspense fallback={<CanvasLoader />}>
                <OrbitControls
                    autoRotate
                    enableZoom={true}
                    enablePan={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={0}
                    enableDamping={true}
                    dampingFactor={0.25}
                    rotateSpeed={0.5}
                />
                <Shoetwo isMobile={isMobile} resetPosition={handleResetPosition} />
            </Suspense>

            <Preload all />
        </Canvas>
    );
};

export default ModelTwo;
