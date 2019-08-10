const webdriver = {
  start_process: true,
  server_path: "node_modules/.bin/chromedriver",
  port: 9515,
  log_path: false
};

module.exports = {
  src_folders: ["tests"],

  output_folder: "test-results",

  test_runner: {
    type: "mocha",
    options: {
      ui: "bdd",
      reporter: "list"
    }
  },

  test_settings: {
    default: {
      webdriver: { ...webdriver, server_path: "/usr/bin/safaridriver" },

      desiredCapabilities: {
        browserName: "safari"
      }
    },
    ci: {
      webdriver,

      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: [ "--headless", "--no-sandbox", "--disable-gpu"]
        }
      },

      screenshots: {
        enabled: true,
        path: "./",
        on_failure: true,
        on_error: true
      }
    }
  }
};
