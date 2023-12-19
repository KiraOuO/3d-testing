import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Preload } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const ShoesModel = ({ shoe, camera, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [loadedModel, setLoadedModel] = useState(null);

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
                    "http://puppetpalm.com:8080/files/get-file?directory=" +
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

    return (
        <Canvas>
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
                />
                {loadedModel && (
                    <mesh>
                        <group>
                            <primitive
                                object={loadedModel}
                                scale={isMobile ? 4 * scaleFactor : 11.8 * scaleFactor}
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
