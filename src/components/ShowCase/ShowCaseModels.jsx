import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, Environment } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import TWEEN from "@tweenjs/tween.js";

const initialRotation = new THREE.Euler(-0.01, -0.2, -0.1);

const Shoe = ({ isMobile, shoe, forwardedRef, onMouseDown, onMouseUp }) => {
    const [loadedModel, setLoadedModel] = useState();

    const url = `https://puppetpalm.com:9999/files/get-file?directory=${shoe.id}&filename=${shoe.lowPolygonPath}`;

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
        <mesh ref={forwardedRef} onPointerDown={onMouseDown} onPointerUp={onMouseUp}>
            {loadedModel && (
                <group>
                    <ambientLight />
                    <primitive
                        object={loadedModel}
                        scale={isMobile ? 0.5 : 0.8}
                        position={isMobile ? [0, 0, 0] : [0, 0, 0]}
                        rotation={initialRotation}
                    />
                </group>
            )}
        </mesh>
    );
};

const ShowCaseModels = ({ shoe }) => {
    const canvasRef = useRef(null);
    const controls = useRef();
    const meshRef = useRef();
    const [shouldAnimateReset, setShouldAnimateReset] = useState(false);

    const handleResetCamera = () => {
        setShouldAnimateReset(true);
    };

    useEffect(() => {
        if (shouldAnimateReset && controls.current) {
            const currentCameraPosition = controls.current.object.position.clone();
            const currentTarget = controls.current.target.clone();

            new TWEEN.Tween({ progress: 0 })
                .to({ progress: 1 }, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((obj) => {
                    const easedProgress = obj.progress;
                    if (controls.current) {
                        const newPosition = new THREE.Vector3().lerpVectors(
                            currentCameraPosition,
                            new THREE.Vector3(20, 2, 5),
                            easedProgress
                        );
                        const newTarget = new THREE.Vector3().lerpVectors(
                            currentTarget,
                            new THREE.Vector3(0, 0, 0),
                            easedProgress
                        );

                        controls.current.object.position.copy(newPosition);
                        controls.current.target.copy(newTarget);

                        controls.current.update();
                    }
                })
                .onComplete(() => {
                    setShouldAnimateReset(false);
                })
                .start();
        }
    }, [shouldAnimateReset, controls.current]);


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
        const animate = () => {
            requestAnimationFrame(animate);
            TWEEN.update();
        };

        animate();
    }, []);

    return (
        <Canvas
            onMouseUp={handleResetCamera}
            onTouchEnd={handleResetCamera}
            ref={canvasRef}
            frameloop="demand"
            camera={{ position: [20, 2, 5], fov: 0.7, near: 1, far: 5000 }}
            gl={{ preserveDrawingBuffer: true }}
        >
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

            <Shoe forwardedRef={meshRef} isMobile={false} shoe={shoe} />

            <Environment preset="city" background={false} />
            <Preload all />
        </Canvas>
    );
};

export default ShowCaseModels;
