import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Preload } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useBeforeUnload } from "react-router-dom";

const ShoesModel = ({ shoe, camera, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [loadedModel, setLoadedModel] = useState(null);
    const [isTimerFinished, setTimerFinished] = useState(true);
    const source = axios.CancelToken.source();

    useBeforeUnload(() => {
        source.cancel("Request canceled by user");
    });

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
                    cancelToken: source.token,
                });

                const dracoLoader = new DRACOLoader();
                const gltfLoader = new GLTFLoader();
                gltfLoader.setDRACOLoader(dracoLoader);

                const gltf = await new Promise((resolve, reject) => {
                    gltfLoader.parse(responseModel.data, "", resolve, reject);
                });

                setLoadedModel(gltf.scene);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                } else {
                    console.error("Error during the request:", error.message);
                }
            }
        };

        fetchData();

        return () => {
            source.cancel("Component unmounted");
        };
    }, [shoe, source]);

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
                <ambientLight />
                <OrbitControls
                    ref={camera}
                    enableZoom={true}
                    enablePan={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={0}
                    enableDamping={true}
                    dampingFactor={0.25}
                    rotateSpeed={0.5}
                    autoRotate={isTimerFinished}
                    focus={50}
                />
                {loadedModel && (
                    <mesh>
                        <group>
                            <primitive
                                object={loadedModel}
                                scale={isMobile ? 21 * scaleFactor : 15.8 * scaleFactor}
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
