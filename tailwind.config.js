// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        think: {
          "0%, 100%": { opacity: 0.5, transform: "translateY(0px)" },
          "50%": { opacity: 1, transform: "translateY(-3px)" },
        },
      
        dot: {
          "0%, 80%, 100%": { opacity: 0 },
          "40%": { opacity: 1 },
        },
      },
      animation: {
        think: "think 1s infinite ease-in-out",
        dot: "dot 1.2s infinite ease-in-out",
      },
      transitionDelay: {
        0: "0ms",
        200: "200ms",
        400: "400ms",
      },
    },
  },
  plugins: [],
};
