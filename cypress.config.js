const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // eventos ou plugins podem ser configurados aqui
    },
  },
});
