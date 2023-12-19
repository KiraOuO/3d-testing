// В отдельном файле, например, ThemeStorage.js
export const getThemeFromLocalStorage = () => {
    return localStorage.getItem("selectedMode") || "light";
};

export const setThemeToLocalStorage = (mode) => {
    localStorage.setItem("selectedMode", mode);
};
