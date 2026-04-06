/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "primary": "#22c55e",
                "text-main": "#1e293b",
                "text-secondary": "#64748b",
                "text-muted": "#94a3b8",
            },
            colors: {
                "primary": "#10bc5d",
                "background-light": "#f6f8f7",
                "background-dark": "#102218",
                "title": "#141C21",
                "secondary-text": "#3D3D3D",
                "muted-text": "#8B8B8B",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "arimo": ["Arimo", "sans-serif"],
                "nunito": ["Nunito", "sans-serif"],
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [],
};
