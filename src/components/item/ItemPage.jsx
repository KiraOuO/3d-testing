import {useEffect, useRef, useState} from "react";
import {ComputersCanvas} from "../canvas/index.js";
import {useLocation} from "react-router-dom";
import axios from "axios";

const ItemPage = () => {

    const camera = useRef();
    const [, setActive] = useState("");
    const [scaleFactor, setScaleFactor] = useState(1.0);
    const [expanded] = useState(true);
    const location = useLocation();
    const [targetShoe, setTargetShoe] = useState(null);
    const [background, setBackground] = useState(null);


    const [containerStyles, setContainerStyles] = useState({
        position: 'relative',
        top: '',
        left: '',
        width: '',
        height: '',
        zIndex: 0,
        backgroundImage: 'none',
        backgroundSize: '',
        backgroundRepeat: '',
        backgroundPosition: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const id = searchParams.get('id');

                const responseShoe = await axios.post(`http://puppetpalm.com:8080/api/get-model-page/${id}`);
                setTargetShoe(responseShoe);

                const url = 'http://puppetpalm.com:8080/files/get-file?directory=' + id + '&filename=' + responseShoe.data.backgroundPath;
                const response = await axios.get(url, { responseType: 'arraybuffer' });

                let arrayBufferView = new Uint8Array(response.data);
                const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
                const imageUrl = URL.createObjectURL(blob);

                setBackground(imageUrl);
            } catch (error) {
                console.error('Error during the request:', error.message);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const isMobile = window.innerWidth <= 768;

        const updatedContainerStyles = {
            position: expanded ? "fixed" : "relative",
            top: expanded ? 0 : "",
            left: expanded ? 0 : "",
            width: expanded ? (isMobile ? "100%" : "100%") : "",
            height: expanded ? (isMobile ? "100%" : "100%") : "",
            zIndex: expanded ? 1 : 0,
            backgroundImage: expanded ? `url(${background || ''})` : 'none',
            backgroundSize: expanded ? "fill" : "cover",
            backgroundRepeat: expanded ? "no-repeat" : "",
            backgroundPosition: expanded ? "center center" : "",
        };

        setContainerStyles(updatedContainerStyles);
    }, [expanded, background]);

    const handleIncreaseSize = () => {
        setScaleFactor(scaleFactor * 1.15);
    };

    const handleDecreaseSize = () => {
        setScaleFactor(scaleFactor * 0.85);
    }

    return (
        <div className="sm:h-[30rem] lg:h-[42rem] h-[300px] object-center">
            <a
                href='/'
                className='flex items-center my-6 h-6 w-12'
                onClick={() => {
                    setActive("");
                    window.scrollTo(0, 0);
                }}
            >
                <div
                    className="sm:w-9 w-8 ml-3 z-50 bg-white h-7 sm:h-7 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                    <img src="/expand-screen.png" alt="expand screen" className="cursor-pointer"/>
                </div>
            </a>
            <button
                className='flex items-center my-6 h-6 w-12'
                onClick={() => {
                    setActive("");
                    handleIncreaseSize();
                }}
            >
                <div
                    className="sm:w-9 w-8 ml-3 z-50 bg-white h-8 sm:h-9 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                    <p className='text-black'>+</p>
                </div>
            </button>
            <button
                className='flex items-center my-6 h-6 w-12'
                onClick={() => {
                    setActive("");
                    handleDecreaseSize();
                }}
            >
                <div
                    className="sm:w-9 w-8 ml-3 z-50 bg-white h-8 sm:h-9 text-xs px-2 pt-1 font-semibold rounded uppercase hover:bg-gray-700 flex items-start">
                    <p className='text-black'>-</p>
                </div>
            </button>
            <div className="h-full w-full" style={containerStyles}>
                <ComputersCanvas shoe={targetShoe} camera={camera}  scaleFactor={scaleFactor}/>
            </div>
        </div>);
};

export default ItemPage;