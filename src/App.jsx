import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Home, ItemPage, Footer } from './components';
import { getThemeFromLocalStorage } from './components/technical/ThemeStorage';

const WithNavbar = ({ children }) => {
    const [selectedMode, setSelectedMode] = useState(getThemeFromLocalStorage());

    const updateSelectedMode = (mode) => {
        setSelectedMode(mode);
    };

    return (
        <div className={`dark:bg-[#1c1c1e] bg-gray-200 overflow-y-auto object-cover`}>
            <Navbar selectedMode={selectedMode} updateSelectedMode={updateSelectedMode} />
            {children}
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <div className='relative z-0 overflow-hidden'>
                <Routes>
                    <Route path='/' element={<WithNavbar><Home /></WithNavbar>} />
                    <Route path='/item' element={<ItemPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
