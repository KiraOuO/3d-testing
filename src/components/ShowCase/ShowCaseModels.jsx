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
        "https://puppetpalm.com:9999/files/get-file?directory=" +
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
                console.error("Error response data:", error.response.data);
                console.error("Error status:", error.response.status);
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
    const controls = useRef();
    const meshRef = useRef();
    const [shouldAnimateReset, setShouldAnimateReset] = useState(false);
    const [isMobile] = useState(false);

    const handleResetCamera = () => {
        setShouldAnimateReset(true);
    };


    useEffect(() => {
        const handleWindowMouseUp = () => {
            handleResetCamera();
        };

        window.addEventListener("mouseup", handleWindowMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleWindowMouseUp);
        };
    }, []);

    useEffect(() => {
        if (shouldAnimateReset && controls.current) {
            const initialTarget = new THREE.Vector3(0, 0, 0);
            const initialPosition = new THREE.Vector3(23, 0, 0);

            const duration = 500;

            const cubicEaseInOut = (t) => (t < 2 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2);

            const updateAnimation = () => {
                const startTime = Date.now();
                const update = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(1, elapsed / duration);

                    const easedProgress = cubicEaseInOut(progress);

                    controls.current.target.lerp(initialTarget, easedProgress);
                    controls.current.object.position.lerp(initialPosition, easedProgress);

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        setShouldAnimateReset(false);
                    }
                };

                update();
            };

            updateAnimation();
        }
    }, [shouldAnimateReset, controls.current]);

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
                <directionalLight
                    position={[0, -10, 0]}
                    intensity={2.5}
                    color={0xffffff}
                    castShadow
                    shadow-mapSize-width={512}
                    shadow-mapSize-height={512}
                    shadow-camera-far={100}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <directionalLight
                    position={[10, 2, 5]}
                    intensity={2}
                    color={0xffffff}
                    castShadow
                    shadow-mapSize-width={512}
                    shadow-mapSize-height={512}
                    shadow-camera-far={100}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />

                <Shoe forwardedRef={meshRef} isMobile={isMobile} shoe={shoe} />
                <Environment preset="city" background={false} />
            </Suspense>
            <Preload all />
        </Canvas>
    );
};

export default ShowCaseModels;
