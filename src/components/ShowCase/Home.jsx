import React, { useEffect, useState } from "react";
import { ShowCaseModels } from "../models/index.js";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./block.css";

const Home = () => {
    const [shoes, setShoes] = useState([]);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage, setLastClickTime] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    useEffect(() => {
        axios
            .get(`http://puppetpalm.com:8080/api/get-showcase-page?page=${currentPage - 1}&size=${pageSize}`)
            .then((response) => setShoes(response.data.content))
            .catch((error) => console.error('Error during the request:', error.message));
    }, [currentPage, pageSize]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const handleModelClick = (id) => {
        const currentTime = new Date().getTime();
        const delay = currentTime - lastClickTime;

        if (delay < 300) {
            window.location.href = `/item?id=${id}`;
        } else {
            setLastClickTime(currentTime);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <section className={'flex flex-col min-h-screen bg-cover bg-mainbg'}>
            <div className="pb-12 flex justify-center items-center h-full mb-0 relative">
                <div className="mx-auto grid max-w-6xl gap-6 max-[375px]:grid-cols-1 grid-cols-2 lg:grid-cols-3">
                    {shoes.map((shoe, index) => (
                        <div
                            key={index}
                            style={{ backgroundColor: 'rgba(128,128,128, 0.45)' }}
                            className="rounded-xl shadow-lg shadow-gray-950 bg-white w-full sm:w-full md:w-[340px] lg:w-[325px] xl:w-[280px] max-h-[320px] hover:shadow-xl hover:transform hover:shadow-gray-600 hover:scale-105 border border-white dark:border-[#2c2c2e] duration-300 border-t-8 border-x-8 sm:h-72 h-64 mt-7 overflow-hidden justify-between items-center mx-auto"
                            onClick={() => handleModelClick(shoe.id)}
                        >
                            <div className={`max-w-sm mx-auto text-center block w-full py-0 font-bold sm:h-52 h-44 uppercase tracking-wide text-gray-800`}>
                                <ShowCaseModels shoe={shoe} />
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
                <div className="max-w-full dark:bg-[#2c2c2e] md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white p-6 rounded-lg mx-auto shadow-sm">
                    <div className="flex justify-center">
                        <nav className="flex space-x-2" aria-label="Pagination">
                            {currentPage > 1 && (
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="relative dark:text-white inline-flex items-center px-4 py-2 text-sm border border-black hover:border-violet-100 text-black font-semibold cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                                >
                                    Previous
                                </button>
                            )}
                            <span
                                className="relative dark:bg-[#2c2c2e] inline-flex items-center dark:hover:border-white dark:text-white px-4 py-2 text-sm font-medium text-black bg-white border border-black hover:bg-blue-300 cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                            >
                                {currentPage}
                            </span>
                            {shoes.length === pageSize && (
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="relative dark:text-white inline-flex items-center px-4 py-2 text-sm border border-black hover:border-violet-100 text-black font-semibold cursor-pointer leading-5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                                >
                                    Next
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Home;