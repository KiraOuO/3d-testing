import  {Suspense, useEffect, useState} from "react";
import {Canvas} from "@react-three/fiber";
import {Environment, OrbitControls, Preload, } from "@react-three/drei";
import CanvasLoader from "../Loader.jsx";
import * as THREE from 'three';
import axios from "axios";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
import { Mesh} from "three";


const ComputersCanvas = ({ shoe, camera, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTimerFinished, setTimerFinished] = useState(true);
    let timer;

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

    const startTimer = () => {
        timer = setTimeout(() => {
            setTimerFinished(true);
        }, 10000);

        return () => clearTimeout(timer);
    };

    useEffect(() => {
        startTimer();

        return () => clearTimeout(timer);
    }, [isTimerFinished]);

    const restartTimer = () => {
        clearTimeout(timer);
        startTimer();
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
                    autoRotate={isTimerFinished}
                    enableZoom={true}
                    enablePan={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={0}
                    enableDamping={true}
                    dampingFactor={0.25}
                    rotateSpeed={0.5}
                />
                <Shoes isMobile={isMobile} scaleFactor={scaleFactor} shoe={shoe} />
                <Environment preset="city" background={false} />
            </Suspense>
            <Preload all />
        </Canvas>
    );
};

const Shoes = ({isMobile, shoe, scaleFactor}) => {
    const [loadedModel, setLoadedModel] = useState(new Mesh());

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!shoe || !shoe.data) {
                    return;
                }
                const url = 'http://puppetpalm.com:8080/files/get-file?directory=' + shoe.data.id + '&filename=' + shoe.data.highPolygonPath;

                const responseModel = await axios.get(url, { responseType: 'arraybuffer' });
                const dracoLoader = new DRACOLoader();

                const gltfLoader = new GLTFLoader();
                gltfLoader.setDRACOLoader(dracoLoader);


                const gltf = await new Promise((resolve, reject) => {
                    gltfLoader.parse(responseModel.data, '', resolve, reject);
                });
                setLoadedModel(gltf.scene);
            } catch (error) {
                console.error('Error during the request:', error.message);
            }
        };

        fetchData();
    }, [shoe]);

    useEffect(() => {
        loadedModel.traverse((child) => {
            if (child.isMesh) {
                child.material.side = THREE.FrontSide;
            }
        });
    }, [loadedModel]);

    return (
        <mesh>
            <group>
                <primitive
                object={loadedModel}
                scale={isMobile ? 4 * scaleFactor : 7.2 * scaleFactor}
                rotation={[-0.01, -0.2, -0.1]}
                position={[0, 0, 0]}
                />
            </group>
        </mesh>

    );
};
export default ComputersCanvas;
