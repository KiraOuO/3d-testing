import { useEffect, useState } from "react";
import { logo } from "../../../assets/index.js";
import { getThemeFromLocalStorage, setThemeToLocalStorage } from "../ThemeStorage.js";

const Navbar = ({setTemp}) => {
    const [selectedMode, setSelectedMode] = useState(getThemeFromLocalStorage());

    const toggleTheme = (mode) => {
        document.documentElement.className = mode;
        setSelectedMode(mode);
        setTemp(mode);
        setThemeToLocalStorage(mode);
    };

    useEffect(() => {
        document.documentElement.className = selectedMode;
    }, [selectedMode]);

    const handleThemeChange = (event) => {
        toggleTheme(event.target.value);
    };

    return (
        <header className={`bg-opacity-0`}>
            <div className="mx-auto my-2 max-w-screen-xl py-0 px-2 sm:px-6 lg:px-2">
                <div className="flex sm:flex-row flex-col-reverse items-center justify-end gap-4">
                    <a href='/' className='flex items-center gap-2' onClick={() => { setActive(""); window.scrollTo(0, 0); }}>
                        <img src={logo} alt='logo' className='w-11 h-11 object-contain' />
                        <p className={`text-${selectedMode === 'dark' ? 'white' : 'black'} text-[18px] font-bold cursor-pointer flex`}>
                            Shoes &nbsp;<span className='sm:block hidden'>3D Model</span>
                        </p>
                    </a>
                    <div className="flex items-center gap-4">
                        <select
                            className={`text-${selectedMode === 'dark' ? 'bg-black' : 'black'} ${selectedMode === 'light' ? 'bg-gray-100' : ''} rounded-full px-2 py-0.5 `}
                            value={selectedMode}
                            onChange={handleThemeChange}
                        >
                            <option value="light">Light mode</option>
                            <option value="dark" className="bg-black text-white">Dark mode</option>
                        </select>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;