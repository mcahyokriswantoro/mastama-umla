import type { Config } from "tailwindcss";

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
        background: "var(--background)",
        foreground: "var(--foreground)",
        umla: {
          navy: {
            DEFAULT: "#0F2042",
            50: "#F0F4FA",
            100: "#DCE5F3",
            200: "#B8CBE7",
            300: "#8FAFDA",
            400: "#5D8FCA",
            500: "#2B6CB5",
            600: "#1D5293",
            700: "#153D70",
            800: "#0F2042",
            900: "#09142A",
            950: "#050A17",
          },
          gold: {
            DEFAULT: "#D4AF37",
            50: "#FCF9EC",
            100: "#F7F1D0",
            200: "#EFE2A3",
            300: "#E6D172",
            400: "#D4AF37",
            500: "#B59124",
            600: "#8F7018",
            700: "#6B5210",
            800: "#48360A",
            900: "#271C04",
          },
          emerald: {
            DEFAULT: "#059669",
            light: "#10B981",
            dark: "#047857"
          }
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'stamp-in': 'stampIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        stampIn: {
          '0%': { opacity: '0', transform: 'scale(2.5) rotate(-15deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--stamp-rotate, -6deg))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
