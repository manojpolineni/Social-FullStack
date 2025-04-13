/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
      // darkMode: 'class', // <- this is required
      content: [
            "./src/**/*.{js,jsx,ts,tsx}",
      ],
      theme: {
            extend: {}
      },
      plugins: [daisyui],
      daisyui: {
            themes: ["light", "dark"],
      },
}
