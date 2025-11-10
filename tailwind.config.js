/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                "primary-background": "#0C0F1C",
                surface: "#1A1D29",
                "text-primary": "#E6E6E6",
                "text-secondary": "#A3A3B3",
                placeholder: "#5C5C7B",
                "primary-accent": "#6E56CF",
                "secondary-accent": "#3DC0C0",
                error: "#FF6B6B",
                success: "#50E3C2",
                white: "#FFFFFF",
            },
            fontFamily: {
                sans: ['"Inter"', "sans-serif"],
                display: ['"Poppins"', "sans-serif"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
            },
            boxShadow: {
                "glow-primary": "0 0 20px rgba(110, 86, 207, 0.5)",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-in-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "pulse-slow": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
                "pulse-speaker": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.1)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.8s ease-out forwards",
                "slide-in-up": "slide-in-up 0.6s ease-out forwards",
                "pulse-slow":
                    "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "pulse-speaker": "pulse-speaker 1s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
