import {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import {logo} from "../assets/index.js";
import {getThemeFromLocalStorage, setThemeToLocalStorage} from "./technical/ThemeStorage.js";

const Navbar = () => {
    const [selectedMode, setSelectedMode] = useState(getThemeFromLocalStorage());

    const toggleTheme = (mode) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(mode);
        setSelectedMode(mode);
        setThemeToLocalStorage(mode);
    };

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(selectedMode);
    }, [selectedMode]);

    const handleThemeChange = (event) => {
        toggleTheme(event.target.value);
    };

    return (
        <header className={`bg-opacity-0 ${selectedMode === 'dark' ? 'dark:bg-black' : ''}`}>
            <div className="mx-auto max-w-screen-xl py-0 px-2 my-2 sm:px-6 lg:px-2">
                <div className="flex sm:flex-row flex-col-reverse items-center justify-end gap-4">
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="block shrink-0 rounded-full bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                                <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </a>
                    </div>
                    <a
                        href='/'
                        className='flex items-center gap-2'
                        onClick={() => {
                            setActive("");
                            window.scrollTo(0, 0);
                        }}
                    >
                        <img src={logo} alt='logo' className='w-11 h-11 object-contain' />
                        <p className={`text-${selectedMode === 'dark' ? 'white' : 'black'} text-[18px] font-bold cursor-pointer flex`}>
                            Shoes &nbsp;
                            <span className='sm:block hidden'>3D Model</span>
                        </p>
                    </a>
                    <div className="flex items-center gap-4">
                        <select
                            className={`text-${selectedMode === 'dark' ? 'white' : 'black'} 
                            ${selectedMode === 'light' ? 'bg-gray-100' : ''}`}
                            value={selectedMode}
                            onChange={handleThemeChange}
                        >
                            <option value="light">Light mode</option>
                            <option value="dark">Dark mode</option>
                        </select>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
