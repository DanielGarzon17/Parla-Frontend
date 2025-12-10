
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        learn: {
          DEFAULT: "hsl(var(--learn))",
          foreground: "hsl(var(--learn-foreground))",
        },
        stat: {
          bg: "hsl(var(--stat-bg))",
          foreground: "hsl(var(--stat-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "card-left": {

          DEFAULT: "hsl(var(--card-left))",

          foreground: "hsl(var(--card-left-foreground))",

          selected: "hsl(var(--card-left-selected))",

        },

        "card-right": {

          DEFAULT: "hsl(var(--card-right))",

          foreground: "hsl(var(--card-right-foreground))",

          selected: "hsl(var(--card-right-selected))",

        },

        "back-button": "hsl(var(--back-button))",

        "continue-button": "hsl(var(--continue-button))",

        "check-icon": {

          DEFAULT: "hsl(var(--check-icon))",

          selected: "hsl(var(--check-icon-selected))",

        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        quiz: {

          card: "hsl(var(--quiz-card))",

          "card-hover": "hsl(var(--quiz-card-hover))",

        },

        "button-primary": "hsl(var(--button-primary))",

        "button-secondary": "hsl(var(--button-secondary))",

        "timer-ring": "hsl(var(--timer-ring))",

        "avatar-bg": "hsl(var(--avatar-bg))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-slow": "bounce 3s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
