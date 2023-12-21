import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Preload, PerspectiveCamera } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const ShoesModel = ({ shoe, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [loadedModel, setLoadedModel] = useState(null);
    const [isTimerFinished, setTimerFinished] = useState(true);
    const camera = useRef();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!shoe || !shoe.data) {
                    return;
                }

                const url =
                    "https://puppetpalm.com:9999/files/get-file?directory=" +
                    shoe.data.id +
                    "&filename=" +
                    shoe.data.highPolygonPath;

                const responseModel = await axios.get(url, {
                    responseType: "arraybuffer",
                });

                const dracoLoader = new DRACOLoader();
                const gltfLoader = new GLTFLoader();
                gltfLoader.setDRACOLoader(dracoLoader);

                const gltf = await new Promise((resolve, reject) => {
                    gltfLoader.parse(responseModel.data, "", resolve, reject);
                });

                setLoadedModel(gltf.scene);
            } catch (error) {
                console.error("Error during the request:", error.message);
            }
        };

        fetchData();
    }, [shoe]);

    useEffect(() => {
        if (loadedModel) {
            loadedModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.side = THREE.FrontSide;
                }
            });
        }
    }, [loadedModel]);

    const startTimer = () => {
        const timer = setTimeout(() => {
            setTimerFinished(true);
        }, 5000);

        return () => clearTimeout(timer);
    };

    useEffect(() => {
        const timer = startTimer();

        return () => clearTimeout(timer);
    }, [isTimerFinished]);

    const restartTimer = () => {
        setTimerFinished(false);
    };

    return (
        <Canvas
            onMouseUp={restartTimer}
            onTouchEnd={restartTimer}
        >
            <Suspense fallback={<CanvasLoader />}>
                <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 10]} fov={30} />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={0}
                    enableDamping={true}
                    dampingFactor={0.25}
                    rotateSpeed={0.5}
                    autoRotate={isTimerFinished}
                    focus={10}
                />
                {loadedModel && (
                    <mesh>
                        <group>
                            <primitive
                                object={loadedModel}
                                scale={isMobile ? 6 * scaleFactor : 15.8 * scaleFactor}
                                rotation={[-0.01, 1.5, -0.1]}
                                position={[0, 0, 0]}
                            />
                        </group>
                    </mesh>
                )}
                <Environment preset="city" background={false} />
            </Suspense>
            <Preload all />
        </Canvas>
    );
};

export default ShoesModel;
