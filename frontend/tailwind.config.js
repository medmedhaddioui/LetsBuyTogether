const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: color("surface"),
        ink: color("text"),
        slate: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [
            n,
            color(`slate-${n}`),
          ]),
        ),
        brand: Object.fromEntries(
          [50, 100, 500, 600, 700, 900].map((n) => [n, color(`brand-${n}`)]),
        ),
      },
      boxShadow: { card: "0 12px 40px rgb(0 0 0 / .06)" },
    },
  },
  plugins: [],
};
