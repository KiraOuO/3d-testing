import  {useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Home, ItemPage, Footer } from "./components";
import {getThemeFromLocalStorage} from "./components/technical/ThemeStorage.js";

// eslint-disable-next-line react/prop-types
const WithNavbar = ({ children }) => {
    const [selectedMode, setSelectedMode] = useState(getThemeFromLocalStorage());

    const updateSelectedMode = (mode) => {
        setSelectedMode(mode);
    };

    return (
        <div className="dark:bg-[#1c1c1e] bg-gray-200 overflow-y-auto object-cover">
            <Navbar selectedMode={selectedMode} updateSelectedMode={updateSelectedMode} />
            {children}
            <Footer />
        </div>
    );
};


const App = () => {

    return (
        <BrowserRouter>
            <div className='relative z-0 bg-primary overflow-hidden'>
                <Routes>
                    <Route path='/' element={
                        <WithNavbar
             >
                            <Home />
                        </WithNavbar>} />
                    <Route path='/item' element={<ItemPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
