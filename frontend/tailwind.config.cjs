module.exports = {
  content: ['./src/routes/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: false
  }
};
