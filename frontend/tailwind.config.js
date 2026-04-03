export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                sand: "#f4efe7",
                ivory: "#fbfaf7",
                taupe: "#ddd3c5",
                walnut: "#4e453b",
                espresso: "#171717",
                mist: "#f6f2eb",
                stone: "#6d665d",
                highlight: "#111111",
            },
            fontFamily: {
                sans: ['"Open Sans"', "sans-serif"],
                display: ['"Open Sans"', "sans-serif"],
            },
            boxShadow: {
                luxe: "0 24px 50px rgba(17, 17, 17, 0.08)",
                soft: "0 12px 30px rgba(17, 17, 17, 0.06)",
            },
            keyframes: {
                rise: {
                    "0%": { opacity: "0", transform: "translateY(18px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-600px 0" },
                    "100%": { backgroundPosition: "600px 0" },
                },
            },
            animation: {
                rise: "rise 0.7s ease forwards",
                shimmer: "shimmer 1.6s linear infinite",
            },
        },
    },
    plugins: [],
};
