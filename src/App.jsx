import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Home, ItemPage, Footer } from './components';
import { getThemeFromLocalStorage } from './components/technical/ThemeStorage';
import NotFound from "./components/technical/Fragments/NotFound.jsx";

const WithNavbar = ({ children, setTemp }) => {
    return (
        <div className={`dark:bg-[#1c1c1e] bg-gray-200 overflow-y-auto object-cover`}>
            <Navbar setTemp={setTemp}/>
            {children}
            <Footer />
        </div>
    );
};

const App = () => {
    const [temp, setTemp] = useState(null);
    return (
        <Router>
            <div className='relative z-0 overflow-hidden'>
                <Routes>
                    <Route path='/' element={<WithNavbar setTemp={setTemp}><Home temp={temp} /></WithNavbar>} />
                    <Route path='/item' element={<ItemPage />} />
                    <Route path='/not-found' element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
