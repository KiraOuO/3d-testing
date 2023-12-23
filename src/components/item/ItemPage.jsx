import React, { useEffect, useRef, useState } from "react";
import { ShoesModel } from "../models/index.js";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ItemPage = () => {
    const camera = useRef();
    const location = useLocation();
    const [scaleFactor, setScaleFactor] = useState(1.0);
    const [targetShoe, setTargetShoe] = useState(null);
    const [background, setBackground] = useState(null);

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
            try {
                const searchParams = new URLSearchParams(location.search);
                const id = searchParams.get("id");

                const responseShoe = await axios.post(
                    `https://puppetpalm.com:9999/api/get-model-page/${id}`
                );
                setTargetShoe(responseShoe);

                const url =
                    "https://puppetpalm.com:9999/files/get-file?directory=" +
                    id +
                    "&filename=" +
                    responseShoe.data.backgroundPath;
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

    return (
        <div className="h-[300px] object-center">
            <button
                className="flex items-center my-6 h-6 w-12"
                onClick={() => {
                    window.history.back();
                }}
            >
                <div className="sm:w-9 w-8 ml-3 z-50 bg-white h-7 sm:h-7 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                    <img src="/expand-screen.png" alt="expand screen" className="cursor-pointer" />
                </div>
            </button>
            <div className="h-full w-full" style={containerStyles}>
                <ShoesModel shoe={targetShoe} camera={camera} scaleFactor={scaleFactor} />
            </div>
        </div>
    );
};

export default ItemPage;
