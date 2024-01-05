import React, { useEffect, useRef, useState } from "react";
import { ShoesModel } from "../models/index.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {getThemeFromLocalStorage} from "../technical/ThemeStorage.js";

const ItemTechnicalPage = () => {
    const location = useLocation();
    const [scaleFactor, setScaleFactor] = useState(1.0);
    const [targetShoe, setTargetShoe] = useState(null);
    const [background, setBackground] = useState(null);
    const [showText, setShowText] = useState(false); // Add state to control text visibility
    const camera = useRef();

    const [containerStyles, setContainerStyles] = useState({
        position: "relative",
        top: "",
        left: "",
        width: "",
        height: "",
        zIndex: 0,
        backgroundImage: "none",
        backgroundSize: "",
        backgroundRepeat: "",
        backgroundPosition: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            let background;
            try {
                const searchParams = new URLSearchParams(location.search);
                const id = searchParams.get("id");

                const responseShoe = await axios.post(
                    `https://puppetpalm.com:9999/api/get-model-page/${id}`
                );
                setTargetShoe(responseShoe);
                if(getThemeFromLocalStorage() === 'light'){
                    background = responseShoe.data.backgroundPathLight;
                } else {
                    background =  responseShoe.data.backgroundPathDark;
                }
                const url =
                    "https://puppetpalm.com:9999/files/get-file?directory=" +
                    id +
                    "&filename=" +
                    background;
                const response = await axios.get(url, { responseType: "arraybuffer" });

                let arrayBufferView = new Uint8Array(response.data);
                const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
                const imageUrl = URL.createObjectURL(blob);

                setBackground(imageUrl);
            } catch (error) {
                console.error("Error during the request:", error.message);
            }
        };

        fetchData();
    }, [location.search]);

    useEffect(() => {
        const updateContainerStyles = () => {
            const isMobile = window.innerWidth <= 768;

            const updatedContainerStyles = {
                position: "fixed",
                top: 0,
                left: 0,
                width: isMobile ? "100%" : "100%",
                height: isMobile ? "100%" : "100%",
                zIndex: 1,
                backgroundImage: `url(${background || ""})`,
                backgroundSize: isMobile ? "cover" : "100% 220%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
            };

            setContainerStyles(updatedContainerStyles);
        };

        // Initial call
        updateContainerStyles();

        // Call on window resize
        window.addEventListener("resize", updateContainerStyles);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", updateContainerStyles);
        };
    }, [background]);

    const handleInteractivePointClick = () => {
        setShowText(!showText);
    };

    return (
        <div className="h-[300px] object-center">
                <button
                    className="flex items-center my-8 h-6 w-12"
                    onClick={() => {
                        if (camera.current) {
                            alert(`Camera Position: X: ${camera.current.position.x.toFixed(2)}, Y: ${camera.current.position.y.toFixed(2)}, Z: ${camera.current.position.z.toFixed(2)}`);
                        } else {
                            alert('Camera position is not available yet. Please wait for the data to load.');
                        }
                    }}
                >

                    <div className="sm:w-24 w-24 ml-3 z-50 bg-white bg-opacity-80 h-12 sm:h-12 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                        <span>Show Coordinates</span>
                    </div>
                </button>
                <button
                    className="flex items-center my-6 h-6 w-12"
                >

                    <div className="sm:w-24 bg-opacity-80 w-24 ml-3 z-50 bg-white h-12 sm:h-12 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                        <span>Update Coordinates</span>
                    </div>
                </button>

            <div className="h-full w-full" style={containerStyles}>
                <ShoesModel shoe={targetShoe} scaleFactor={scaleFactor} camera={camera} onClick={handleInteractivePointClick} />
                {showText && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white", textAlign: "center", padding: "10px", background: "white", width: 50, height: 50, borderRadius: "5px", zIndex: "999" }}>
                        Clicked! Display your text here.
                    </div>
                )}
            </div>

        </div>

    );
};

export default ItemTechnicalPage;
