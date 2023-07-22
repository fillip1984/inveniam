import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      // Color Scheme: https://coolors.co/6b6054-929487-a1b0ab-c3dac3-d5ecd4
      // gray: "#A1B0AB",
      // gray2: "#929487",
      // brown: "#6B6054",
      // green: "#C3DAC3",
      // mint: "#D5ECD4",

      primary: "#6E7E85",
      secondary: "#E2E2E2",
      accent: "#B7CECE",
      accent2: "#BBBAC6",
      black: "#1C0F13",
      white: "#fff",
      danger: "#EB4C7C",
      danger2: "#EB4C7C",
      warning: "#F0E3B2",
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
