import React, {useEffect, useState} from "react";
import {ShowCaseModels} from "../models/index.js";
import {useLocation} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./block.css";
import {getThemeFromLocalStorage} from "../technical/ThemeStorage.js";

const Home = ({temp}) => {
    const [shoes, setShoes] = useState({
        content: [],
        pageable: {
            pageNumber: 0,
            pageSize: 6,
            sort: {
                sorted: false,
                empty: false,
                unsorted: false,
            },
            offset: 0,
            paged: false,
            unpaged: false,
        },
        totalPages: 0,
        totalElements: 0,
        last: false,
        size: 6,
        number: 0,
        sort: {
            sorted: false,
            empty: false,
            unsorted: false,
        },
        numberOfElements: 0,
        first: false,
        empty: false,
    });

    const {pathname} = useLocation();
    const [lastClickTime, setLastClickTime] = useState(0);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSize, setCurrentSize] = useState(6);
    const [background, setBackground] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const pageParam = searchParams.get("page");
        const sizeParam = searchParams.get("size");

        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const size = sizeParam ? parseInt(sizeParam, 10) : 6;

        setCurrentPage(page);
        setCurrentSize(size);

        axios
            .get(`https://puppetpalm.com:9999/api/get-showcase-page?page=${page - 1}&size=${size}`)
            .then((response) => setShoes(response.data))
            .catch((error) => console.error('Error during the request:', error.message));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await axios.get('https://puppetpalm.com:9999/background-api/get-showcase-background?name=' + getThemeFromLocalStorage());
                const url = "https://puppetpalm.com:9999/files/get-file?" +
                    "directory=" +
                    response.data.directory +
                    "&filename=" +
                    response.data.fileName;

                response = await axios.get(url, {
                    responseType: "arraybuffer",
                });
                let arrayBufferView = new Uint8Array(response.data);
                const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
                const imageUrl = URL.createObjectURL(blob);

                setBackground(imageUrl);
            } catch (error) {
                console.error('Error during the request:', error.message);
            }
        };

        fetchData();
    }, [temp]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const handleModelClick = (param) => {
        const currentTime = new Date().getTime();
        const delay = currentTime - lastClickTime;

        if (delay < 300) {
            // Double-click behavior for model
            window.location.href = `/item?id=${param}`;
        } else {
            setLastClickTime(currentTime);
        }
    };

    const handleIconClick = () => {
        navigate(`/item?id=${shoes.content[0].id}`);
    };

    return (
        <section className={'flex flex-col min-h-screen bg-cover'} style={{ backgroundImage: `url(${background})`}}>
            <div className="pb-12 flex justify-center items-center h-full mb-0 relative">
                <div className="mx-auto grid max-w-6xl gap-6 max-[375px]:grid-cols-1 grid-cols-2 lg:grid-cols-3">
                    {shoes.content.map((shoe, index) => (
                        <div
                            key={index}
                            style={{backgroundColor: 'rgba(128,128,128, 0.45)'}}
                            className="rounded-xl shadow-lg shadow-gray-950 bg-white w-full sm:w-full md:w-[340px] lg:w-[325px] xl:w-[280px] max-h-[320px] hover:shadow-xl hover:transform hover:shadow-gray-600 hover:scale-105 border border-white dark:border-[#2c2c2e] duration-300 border-t-8 border-x-8 sm:h-72 h-64 mt-7 overflow-hidden justify-between items-center mx-auto"
                        >
                            <div
                                className={`max-w-sm mx-auto text-center block w-full py-0 font-bold sm:h-52 h-44 uppercase tracking-wide text-gray-800`}
                                onClick={() => handleModelClick(shoe.id)}
                            >
                                <ShowCaseModels shoe={shoe}/>
                            </div>
                            <div className="h-[110px] dark:bg-[#2c2c2e] bg-white">
                                <div className="flex ml-2 items-center">
                                    <h2 className="text-slate-700 dark:text-[#b0b3b8]">{shoe.brand}</h2>
                                    <div
                                        className="text-xs mr-2 px-2 sm:w-12 w-10 mt-2 h-6 sm:h-9 font-semibold rounded uppercase hover:scale-125 duration-200 flex items-end ml-auto"
                                        onClick={() => navigate(`/item?id=${shoe.id}`)}
                                    >
                                        <img
                                            src="/expand-screen.png"
                                            alt="expand screen"
                                            className="cursor-pointer sm:w-14 sm:pt-0 pt-4 w-10 h-10 sm:h-8"
                                            onClick={handleIconClick}
                                        />
                                    </div>
                                </div>
                                <p className="mt-1 ml-2 text-sm text-slate-400">{shoe.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center py-4">
                <div
                    className="max-w-full dark:bg-[#2c2c2e] md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white p-6 rounded-lg mx-auto shadow-sm">
                    <div className="flex justify-center">
                        <nav className="flex space-x-2" aria-label="Pagination">
                            {shoes.last && (
                                <a
                                    href={`/?page=${currentPage - 1}&size=${currentSize}`}
                                    className="relative dark:text-white inline-flex items-center px-4 py-2 text-sm border border-black hover:border-violet-100 text-black font-semibold cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                                >
                                    Previous
                                </a>
                            )}
                            {Array.from({length: shoes.totalPages}, (_, index) => index).map((pageNumber) => (
                                <span key={pageNumber}>
                                      {pageNumber === shoes.number ? (
                                              <span
                                                  className="relative dark:bg-[#2c2c2e] inline-flex items-center dark:hover:border-white dark:text-white px-4 py-2 text-sm font-medium text-black bg-white border border-black hover:bg-blue-300 cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10">
                                        {currentPage}
                                    </span>
                                      ) : (
                                          <a href={`/?page=${pageNumber+1}&size=${currentSize}`}
                                          className="relative dark:bg-[#2c2c2e] inline-flex items-center dark:hover:border-white dark:text-white px-4 py-2 text-sm font-medium text-black bg-white border border-black hover:bg-blue-300 cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10">
                                              {pageNumber + 1}
                                          </a>
                                      )}
                                </span>
                            ))}
                            {shoes.first && (
                                <a
                                    href={`/?page=${currentPage + 1}&size=${currentSize}`}
                                    className="relative dark:text-white inline-flex items-center px-4 py-2 text-sm border border-black hover:border-violet-100 text-black font-semibold cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                                >
                                    Next
                                </a>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Home;