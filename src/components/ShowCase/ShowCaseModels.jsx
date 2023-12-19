import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, Environment } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Mesh } from "three";

const Shoe = ({ isMobile, shoe, forwardedRef }) => {
    const [loadedModel, setLoadedModel] = useState(new Mesh());

    const url =
        "http://puppetpalm.com:8080/files/get-file?directory=" +
        shoe.id +
        "&filename=" +
        shoe.lowPolygonPath;

    useEffect(() => {
        const loadModel = async () => {
            try {
                const response = await axios.get(url, { responseType: "arraybuffer" });
                const dracoLoader = new DRACOLoader();

                const gltfLoader = new GLTFLoader();
                gltfLoader.setDRACOLoader(dracoLoader);

                const gltf = await new Promise((resolve, reject) => {
                    gltfLoader.parse(response.data, "", resolve, reject);
                });
                setLoadedModel(gltf.scene);
            } catch (error) {
                console.error("Error loading 3D model:", error);
            }
        };

        loadModel();
    }, [url]);

    return (
        <mesh ref={forwardedRef}>
            <group>
                <ambientLight />
                <primitive
                    object={loadedModel}
                    scale={isMobile ? 0.5 : 0.8}
                    position={isMobile ? [0, 0, 0] : [0, 0, 0]}
                    rotation={[-0.01, -0.2, -0.1]}
                />
            </group>
        </mesh>
    );
};

const ShowCaseModels = ({ shoe }) => {
    const canvasRef = useRef(null);
    const [isMobile] = useState(false);
    const meshRef = useRef();
    const controls = useRef();
    const [shouldAnimateReset, setShouldAnimateReset] = useState(false);

    const handleResetCamera = () => {
        setShouldAnimateReset(true);
    };

    useEffect(() => {
        if (shouldAnimateReset && controls.current) {
            const initialTarget = new THREE.Vector3(0, 0, 0);
            const initialPosition = new THREE.Vector3(23, 0, 0);

            const positionThreshold = 5;
            const animateReset = () => {
                controls.current.target.lerp(initialTarget, 0.1);
                controls.current.object.position.lerp(initialPosition, 0.1);

                const isTargetClose = controls.current.target.equals(initialTarget);
                const isPositionClose =
                    controls.current.object.position.distanceTo(initialPosition) <
                    positionThreshold;

                if (!isTargetClose || !isPositionClose) {
                    requestAnimationFrame(animateReset);
                } else {
                    setShouldAnimateReset(false);
                }
            };
            animateReset();
        }
    }, [shouldAnimateReset]);

    return (
        <Canvas
            onMouseUp={handleResetCamera}
            onTouchEnd={handleResetCamera}
            ref={canvasRef}
            frameloop="demand"
            camera={{ position: [20, 2, 5], fov: 0.7, near: 1, far: 5000 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <Suspense fallback={<CanvasLoader />}>
                <OrbitControls
                    onMouseLeave={handleResetCamera}
                    onTouchEnd={handleResetCamera}
                    ref={controls}
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={0}
                    enableDamping={false}
                    dampingFactor={0.25}
                    rotateSpeed={0.4}
                />
                <Shoe
                    forwardedRef={meshRef}
                    isMobile={isMobile}
                    shoe={shoe}
                />
                <Environment preset="city" background={false} />
            </Suspense>
            <Preload all />
        </Canvas>
    );
};
export default ShowCaseModels;
