/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Status colors
        'status-draft': '#94a3b8',
        'status-planning': '#a78bfa',
        'status-in-progress': '#fbbf24',
        'status-on-hold': '#f97316',
        'status-completed': '#22c55e',
        'status-cancelled': '#ef4444',
        // Priority colors
        'priority-critical': '#dc2626',
        'priority-high': '#f97316',
        'priority-medium': '#eab308',
        'priority-low': '#22c55e',
      },
    },
  },
  plugins: [],
}
