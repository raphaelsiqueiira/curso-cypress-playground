const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "2m2j7o",
  e2e: {
    setupNodeEvents(on, config) {
      // eventos ou plugins podem ser configurados aqui
    },
  },
});
