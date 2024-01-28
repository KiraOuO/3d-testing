import React, {Suspense, useEffect, useState, useRef, useCallback} from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Preload, PerspectiveCamera } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import ShoesModelContent from "./interactive_points.jsx";
import ResetButton from "./reset_button.jsx";
import NavigationArrows from "./navigation_arrows.jsx";
import { animateCameraPosition, animateTextBlock } from "./camera_animation.js";
import TextBlock from "./calling_text_block.jsx";
import LightAndEnvironment from "./light_and_enviroment.jsx";
import RotatingTagWithPhysics from "./tag.jsx";
import {Physics} from "@react-three/cannon";



const ShoesModel = ({ gl, shoe, zoom, scaleFactor }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [loadedModel, setLoadedModel] = useState(null);
    const camera = useRef();
    const canvasRef = useRef();
    const controls = useRef();
    const pointerDown = useRef(false);
    const previousPointerPosition = useRef({ x: 5, y: 5 });
    const timerRef = useRef(null);
    const [isTimerFinished, setTimerFinished] = useState(true);
    const [isGreenCircleClicked, setIsGreenCircleClicked] = useState(false);
    const [clickedPointText, setClickedPointText] = useState("");
    const [clickedPointPosition, setClickedPointPosition] = useState(null);
    const [showText, setShowText] = useState(false);
    const textBlockRef = useRef();
    const [isResetButtonVisible, setResetButtonVisible] = useState(true);
    const [isModelClicked, setIsModelClicked] = useState(false);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
    const [interactivePoints, setInteractivePoints] = useState([]);

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

    const cameraResetButton = (index) => {
        const initialCameraPosition = [0, 0, 2];
        const targetPosition = new THREE.Vector3().fromArray(initialCameraPosition);

        animateCameraPosition(camera.current, targetPosition, () => {
            setResetButtonVisible(true);
            animateTextBlock(textBlockRef.current, interactivePoints[index].color);
        });
    };

    const prevCameraClick = () => {
        const prevCameraIndex = (currentCameraIndex - 1 + interactivePoints.length) % interactivePoints.length;
        setCurrentCameraIndex(prevCameraIndex);
        focusCameraOnPoint(prevCameraIndex);
        updateClickedPointInfo(prevCameraIndex);
    };

    const nextCameraClick = () => {
        const nextCameraIndex = (currentCameraIndex + 1) % interactivePoints.length;
        setCurrentCameraIndex(nextCameraIndex);
        focusCameraOnPoint(nextCameraIndex);
        updateClickedPointInfo(nextCameraIndex);
    };

    const updateClickedPointInfo = (index) => {
        const clickedPoint = interactivePoints[index];
        setClickedPointText(clickedPoint.text);
        setClickedPointPosition([...clickedPoint.position]);
        setShowText(true);
    };

    const updateCameraPositionAndActions = (index, targetPosition, textBlockRef) => {
        animateCameraPosition(camera.current, targetPosition, () => {
            animateTextBlock(textBlockRef.current, interactivePoints[index].color);
        });
    };

    const focusCameraOnPoint = (index) => {
        const targetPosition = interactivePoints[index].targetPosition;
        updateCameraPositionAndActions(index, targetPosition, textBlockRef);
    };

    const detectiveClickOnInteractivePointClick = (index) => {
        const clickedPoint = interactivePoints[index];
        setIsGreenCircleClicked(!isGreenCircleClicked);
        setIsModelClicked(true);

        if (clickedPoint.text) {
            setClickedPointText(clickedPoint.text);
        }

        setClickedPointPosition([...clickedPoint.position]);
        setShowText(!isGreenCircleClicked);

        const targetPosition = clickedPoint.targetPosition;
        updateCameraPositionAndActions(index, targetPosition, textBlockRef);
    };

    const setPoints = useCallback((cameraPoints) => {
        for (let i = 0; i < cameraPoints.length; i++) {
            // const ref = React.useRef();
            let interactivePoint = {
                position: [cameraPoints[i].point_x_position, cameraPoints[i].point_y_position, cameraPoints[i].point_z_position],
                onClick: detectiveClickOnInteractivePointClick,
                text: cameraPoints[i].description,
                color: cameraPoints[i].colorDescription,
                targetPosition: new THREE.Vector3(cameraPoints[i].camera_x_position, cameraPoints[i].camera_y_position, cameraPoints[i].camera_z_position),
                ref: React.createRef()
            };
            interactivePoints.push(interactivePoint);
        }
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
                setPoints(shoe.data.cameraPoints);
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
            controls.current.autoRotate = isTimerFinished && !isModelClicked;
            canvasRef.current.dispatchEvent(new Event("pointerup"));
            restartTimer();
        }, 5000);
    };

    useEffect(() => {
        const handlePointerUpGlobal = () => {
            setIsModelClicked(false);
        };
        window.addEventListener("pointerup", handlePointerUpGlobal);
        return () => {
            window.removeEventListener("pointerup", handlePointerUpGlobal);
        };
    }, []);

    useEffect(() => {
        if (controls.current) {
            controls.current.enablePan = false;
            controls.current.enableDamping = true;
            controls.current.dampingFactor = 8;
            controls.current.rotateSpeed = 0.5;
            controls.current.autoRotate = isTimerFinished;
        }
    }, [isTimerFinished]);

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

    const disablingBlockOfTextByTappingTheScreen = (event) => {
        if (textBlockRef.current && !textBlockRef.current.contains(event.target)) {
            setShowText(false);
        }
    };

    useEffect(() => {
        window.addEventListener("pointerdown", disablingBlockOfTextByTappingTheScreen);
        return () => {
            window.removeEventListener("pointerdown", disablingBlockOfTextByTappingTheScreen);
        };
    }, []);

        return (
            <Canvas
                gl={gl}
                onCreated={({ gl }) => {
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.PCFSoftShadowMap;
                }}
                ref={canvasRef}>
                <Suspense fallback={<CanvasLoader />}>
                    <PerspectiveCamera
                        ref={camera}
                        makeDefault
                        position={isMobile ? [0, 0, 3.6] : [0, 0, 1]}
                        fov={isMobile ? 15 : 20}
                    />
                    <OrbitControls
                        target={[0, 0, 0]}
                        enableDamping={true}
                        enablePan={false}
                        onUpdate={() => {}}
                        depthTest={false}
                    />
                    <LightAndEnvironment />
                    <Physics>
                    {loadedModel && (
                        <>
                        <ShoesModelContent
                            camera={camera}
                            loadedModel={loadedModel}
                            scaleFactor={scaleFactor}
                            interactivePoints={interactivePoints}
                        />
                            <RotatingTagWithPhysics parentObject={loadedModel} />
                        </>
                    )}
                    </Physics>

                    {clickedPointText && showText && clickedPointPosition && (
                        <TextBlock showText={showText} text={clickedPointText} textBlockRef={textBlockRef} />
                    )}

                    <ResetButton onClick={() => cameraResetButton(currentCameraIndex)} />
                    <NavigationArrows onPrevClick={prevCameraClick} onNextClick={nextCameraClick} />
                    <Environment preset="city" background={false} />


                </Suspense>
                <Preload all />
            </Canvas>
    );
};
export default ShoesModel;