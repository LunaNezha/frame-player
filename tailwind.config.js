/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Montserrat", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
