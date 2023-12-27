import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Preload, PerspectiveCamera } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const ShoesModel = ({ gl, shoe, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [loadedModel, setLoadedModel] = useState(null);
    const [isTimerFinished, setTimerFinished] = useState(true);
    const camera = useRef();
    const canvasRef = useRef();
    const controls = useRef();
    const pointerDown = useRef(false);
    const previousPointerPosition = useRef({ x: 0, y: 0 });
    const timerRef = useRef(null);

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

    const handlePointerDown = (event) => {
        pointerDown.current = true;
        previousPointerPosition.current = {
            x: event.clientX,
            y: event.clientY,
        };
        restartTimer();
    };

    const handlePointerMove = (event) => {
        if (!pointerDown.current) return;

        const deltaX = event.clientX - previousPointerPosition.current.x;
        const deltaY = event.clientY - previousPointerPosition.current.y;

        if (camera.current) {
            camera.current.rotation.x += deltaY * 0.01;
            camera.current.rotation.y += deltaX * 0.01;
        }

        previousPointerPosition.current = {
            x: event.clientX,
            y: event.clientY,
        };
    };

    const handlePointerUp = () => {
        pointerDown.current = false;
    };

    const restartTimer = () => {
        setTimerFinished(false);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setTimerFinished(true);
            controls.current.autoRotate = isTimerFinished;
            restartTimer();
        }, 3000);
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            canvas.addEventListener("pointerdown", handlePointerDown);
            canvas.addEventListener("pointermove", handlePointerMove);
            canvas.addEventListener("pointerup", handlePointerUp);

            return () => {
                canvas.removeEventListener("pointerdown", handlePointerDown);
                canvas.removeEventListener("pointermove", handlePointerMove);
                canvas.removeEventListener("pointerup", handlePointerUp);
            };
        }
    }, []);

    return (
        <Canvas
            gl={gl}
            onCreated={({ gl }) => {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
            ref={canvasRef}
        >
            <Suspense fallback={<CanvasLoader />}>
                <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 10]} fov={30} />
                <OrbitControls
                    target={[0, 0, 0]}
                    autoRotate={isTimerFinished}
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