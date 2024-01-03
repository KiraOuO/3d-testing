import React, {Suspense, useEffect, useState, useRef, useCallback} from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Preload, PerspectiveCamera, Html } from "@react-three/drei";
import CanvasLoader from "../technical/Loader.jsx";
import * as THREE from "three";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useFrame } from '@react-three/fiber';
import TWEEN from '@tweenjs/tween.js'
import { gsap } from "gsap";

const ShoesModelContent = ({ camera, loadedModel, isMobile, scaleFactor, interactivePoints }) => {
    const updateInteractivePointsRotation = () => {
        interactivePoints.forEach((point) => {
            if (point.ref.current && camera.current) {
                const { x, y, z } = camera.current.position;
                point.ref.current.lookAt(x, y, z);
                const angle = Math.abs(camera.current.position.angleTo(point.ref.current.position));
                const newOpacity = angle > Math.PI / 2 ? 0.7 : 1;
                point.ref.current.material.opacity = newOpacity;
            }
        });
    };

    useFrame(() => {
        updateInteractivePointsRotation();
        TWEEN.update();
    });

    return (
        <group>
            <mesh>
                <primitive
                    object={loadedModel}
                    scale={isMobile ? 6 * scaleFactor : 15.8 * scaleFactor}
                    rotation={[-0.01, 1.5, -0.1]}
                    position={[0, 0, 0]}
                />
            </mesh>
            <mesh
                onClick={() => handleMiddlePointClick()}
                position={[0, 0, 0]}
                scale={0.1}
                material-roughness={1}
            >
                <circleGeometry args={[1, 32]} attach="geometry" />
                <meshBasicMaterial attach="material" color="red" />
            </mesh>
            {interactivePoints.map((point, index) => (
                <mesh
                    key={index}
                    ref={point.ref}
                    onClick={() => point.onClick(index)}
                    position={point.position}
                    scale={0.1}
                    material-roughness={1}
                    castShadow
                    receiveShadow
                >
                    <circleGeometry args={[1, 32]} attach="geometry" />
                    <meshBasicMaterial
                        attach="material"
                        transparent
                        opacity={0.8}
                        depthTest={false}
                    >
                        <primitive
                            attach="map"
                            object={new THREE.TextureLoader().load("public/point.png")}
                        />
                    </meshBasicMaterial>
                </mesh>
            ))}
        </group>
    );
};

const CameraToggleSwitch = ({ onClick }) => {
    return (
        <Html>
            <div
                style={{
                position: "absolute",
                top: "400px",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                zIndex: "999",
            }}>
                <button
                    onClick={onClick}
                    style={{
                        padding: "8px 16px",
                        background: "rgba(255, 255, 255, 0.5)",
                        color: "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        outline: "none",
                        marginRight: "10px",
                        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
                        zIndex: "999",
                    }}
                >
                    Reset
                </button>
            </div>
        </Html>
    );
};

const NavigationArrows = ({ onPrevClick, onNextClick }) => {
    const buttonStyle = {
        background: "rgba(255, 255, 255, 0.5)",
        color: "black",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: "pointer",
        margin: "0 46px 0 36px",
        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
    };

    const containerStyle = {
        position: "absolute",
        top: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    };

    return (
        <Html>
            <div style={containerStyle}>
                <button style={buttonStyle} onClick={onPrevClick}>&lt;</button>
                <button style={buttonStyle} onClick={onNextClick}>&gt;</button>
            </div>
        </Html>
    );
};

const ShoesModel = ({ gl, shoe, scaleFactor }) => {
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

    const handleCameraToggle = () => {
        const initialCameraPosition = [0, 0, 10];
        const targetPosition = new THREE.Vector3().fromArray(initialCameraPosition);
        const currentPosition = new THREE.Vector3().copy(camera.current.position);

        new TWEEN.Tween(currentPosition)
            .to(targetPosition, 900)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.current.position.copy(currentPosition);
            })
            .onComplete(() => {
                setResetButtonVisible(true);
            })
            .start();
    };

    const handlePrevCameraClick = () => {
        const prevCameraIndex = (currentCameraIndex - 1 + interactivePoints.length) % interactivePoints.length;
        setCurrentCameraIndex(prevCameraIndex);
        focusOnCameraPoint(prevCameraIndex);
    };

    const handleNextCameraClick = () => {
        const nextCameraIndex = (currentCameraIndex + 1) % interactivePoints.length;
        setCurrentCameraIndex(nextCameraIndex);
        focusOnCameraPoint(nextCameraIndex);
    };

    const updateClickedPointInfo = (index) => {
        const clickedPoint = interactivePoints[index];
        setClickedPointText(clickedPoint.text);
        setClickedPointPosition([...clickedPoint.position]);
        setShowText(true);
    };

    const focusOnCameraPoint = (index) => {
        const targetPosition = interactivePoints[index].targetPosition;
        const currentPosition = new THREE.Vector3().copy(camera.current.position);

        new TWEEN.Tween(currentPosition)
            .to(targetPosition, 900)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.current.position.copy(currentPosition);
            })
            .onComplete(() => {
                setResetButtonVisible(true);
                updateClickedPointInfo(index);
                if(textBlockRef.current !== undefined){
                    gsap.to(textBlockRef.current.style, { opacity: 1, duration: 0.3, ease: "power3.out", color: interactivePoints[index].color });
                }
            })
        .start();
    };

    const handleInteractivePointClick = (index) => {
        const clickedPoint = interactivePoints[index];
        setIsGreenCircleClicked(!isGreenCircleClicked);
        setIsModelClicked(true);
        if (clickedPoint.text) {
            setClickedPointText(clickedPoint.text);
        }
        setClickedPointPosition([...clickedPoint.position]);
        setShowText(!isGreenCircleClicked);

        const targetPosition = clickedPoint.targetPosition;
        const currentPosition = new THREE.Vector3().copy(camera.current.position);

        new TWEEN.Tween(currentPosition)
            .to(targetPosition, 900)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.current.position.copy(currentPosition);
            })
            .onComplete(() => {
                setResetButtonVisible(true);
                if(textBlockRef.current !== undefined){
                    gsap.to(textBlockRef.current.style, { opacity: 1, duration: 0.3, ease: "power3.out", color: interactivePoints[index].color });
                }

            })
        .start();
    };

    const setPoints = useCallback((cameraPoints) => {
        for (let i = 0; i < cameraPoints.length; i++) {
            // const ref = React.useRef();
            let interactivePoint = {
                position: [cameraPoints[i].point_x_position, cameraPoints[i].point_y_position, cameraPoints[i].point_z_position],
                onClick: handleInteractivePointClick,
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
            camera.current.rotation.x += deltaY * Math.PI;
            camera.current.rotation.y += deltaX * Math.PI;
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

    useEffect(() => {
        const handleWindowResize = () => {
            const newFOV = window.innerWidth < 600 ? 92 : 30;
            camera.current.fov = newFOV;
            camera.current.updateProjectionMatrix();
        };

        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    useEffect(() => {
        const handleWindowClick = (event) => {
            if (textBlockRef.current && !textBlockRef.current.contains(event.target)) {
                setShowText(false);
            }
        };
        window.addEventListener("pointerdown", handleWindowClick);
        return () => {
            window.removeEventListener("pointerdown", handleWindowClick);
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
                    <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 10]} fov={30} />
                    <OrbitControls
                        // autoRotate={isTimerFinished}
                        enableRotate={true}
                        target={[0, 0, 0]}
                        enableDamping={true}
                        enablePan={false}
                        onUpdate={() => {}}
                        depthTest={false}
                        minPolarAngle={-2 * Math.PI}
                        maxPolarAngle={2 * Math.PI}
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
                        <ShoesModelContent
                            camera={camera}
                            loadedModel={loadedModel}
                            scaleFactor={scaleFactor}
                            interactivePoints={interactivePoints}
                        />
                    )}

                    {clickedPointText && showText && clickedPointPosition && (
                        <Html>
                            <div
                                ref={textBlockRef}
                                className={showText.toString()}
                                style={{
                                    fontSize: "24px",
                                    textAlign: "start",
                                    padding: "20px",
                                    width: "300px",
                                    position: "absolute",
                                    transform: "translate(-50%, -50%)",
                                    pointerEvents: "none",
                                    zIndex: 999,
                                    textShadow: "0 0 10px rgba(255,255,255,0.8)",
                                    opacity: 0,
                                }}>
                                {clickedPointText}
                            </div>
                        </Html>
                    )}

                    <CameraToggleSwitch onClick={handleCameraToggle} />
                    <NavigationArrows onPrevClick={handlePrevCameraClick} onNextClick={handleNextCameraClick} />
                    <Environment preset="city" background={false} />
                </Suspense>
                <Preload all />
            </Canvas>
    );
};

export default ShoesModel;
