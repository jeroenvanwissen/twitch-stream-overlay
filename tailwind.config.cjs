const plugin = require("tailwindcss/plugin");
const radialGradientPlugin = require("./radialGradientPlugin");
import scrollBar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,vue}", "./index.html"],
  darkMode: "media",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1800px",
      "4xl": "1920px",
      "5xl": "2200px",
      tv: {
        min: "960px",
        max: "960px",
      },
    },
    extend: {
      width: {
        available: [
          "100%",
          "-webkit-fill-available",
          // 'stretch',
        ],
      },
      minWidth: {
        available: [
          "100%",
          "-webkit-fill-available",
          // 'stretch',
        ],
      },
      maxWidth: {
        available: [
          "100%",
          "-webkit-fill-available",
          // 'stretch',
        ],
      },
      height: {
        available: [
          "100%",
          "-webkit-fill-available",
          "-moz-available",
          "stretch",
        ],
      },
      minHeight: {
        available: [
          "100%",
          "-webkit-fill-available",
          "-moz-available",
          "stretch",
        ],
      },
      maxHeight: {
        available: [
          "100%",
          "-webkit-fill-available",
          "-moz-available",
          "stretch",
        ],
      },
      fontSize: {
        "3xs": ["0.5rem", { lineHeight: "100%" }],
        "2xs": ["0.625rem", { lineHeight: "100%" }],
        xs: ["0.65rem", { lineHeight: "130%" }],
        sm: ["0.8rem", { lineHeight: "140%" }],
        md: ["1rem", { lineHeight: "130%" }],
        base: ["1rem", { lineHeight: "130%" }],
        lg: ["1.25rem", { lineHeight: "120%" }],
        xl: ["1.55rem", { lineHeight: "120%" }],
        "2xl": ["1.95rem", { lineHeight: "120%" }],
        "3xl": ["2.45rem", { lineHeight: "120%" }],
        "4xl": ["3.05rem", { lineHeight: "120%" }],
        "5xl": ["3.8rem", { lineHeight: "120%" }],
      },
      colors: {
        theme: {
          50: "hsl(from var(--color-50) h s l / <alpha-value>)",
          100: "hsl(from var(--color-100) h s l / <alpha-value>)",
          200: "hsl(from var(--color-200) h s l / <alpha-value>)",
          300: "hsl(from var(--color-300) h s l / <alpha-value>)",
          400: "hsl(from var(--color-400) h s l / <alpha-value>)",
          500: "hsl(from var(--color-500) h s l / <alpha-value>)",
          600: "hsl(from var(--color-600) h s l / <alpha-value>)",
          700: "hsl(from var(--color-700) h s l / <alpha-value>)",
          800: "hsl(from var(--color-800) h s l / <alpha-value>)",
          900: "hsl(from var(--color-900) h s l / <alpha-value>)",
          950: "hsl(from var(--color-950) h s l / <alpha-value>)",
        },
      },
    },
  },
  variants: {
    extend: {
      last: ["translate-x", "translate-y"],
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    require("tailwind-children"),
    scrollBar({ nocompatible: true }),
    radialGradientPlugin,
    plugin(({ addVariant }) => {
      addVariant("range-track", [
        "&::-webkit-slider-runnable-track",
        "&::-moz-range-track",
        "&::-ms-track",
      ]);
      addVariant("range-thumb", [
        "&::-webkit-slider-thumb",
        "&::-moz-range-thumb",
        "&::-ms-thumb",
      ]);
    }),
  ],
};
