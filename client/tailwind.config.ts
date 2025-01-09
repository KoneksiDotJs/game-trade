import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'game-primary': '#1a1c23',
        'game-secondary': '#2d3748',
        'game-accent': '#7e3af2'
      },
    },
  },
  plugins: [daisyui],
} satisfies Config;
