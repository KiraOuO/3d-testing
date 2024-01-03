import React from 'react';

const NotFound = () => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Вы можете регулировать высоту по своему усмотрению
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            <h1>404 - Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFound;
