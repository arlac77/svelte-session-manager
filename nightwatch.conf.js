

function chrome(argOptions=["--no-sandbox", "--disable-gpu"]) {
  return {
    webdriver: {
      start_process: true,
      server_path: "node_modules/.bin/chromedriver",
      port: 9515,
      log_path: false
    },

    desiredCapabilities: {
      browserName: "chrome",
      chromeOptions: {
        args: argOptions
      }
    },

    screenshots: {
      enabled: true,
      path: "./",
      on_failure: true,
      on_error: true
    }
  };
}

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
    safari: {
      webdriver: {
        start_process: true,
        server_path: "/usr/bin/safaridriver",
        port: 4445
      },
      desiredCapabilities: {
        browserName: "safari"
      }
    },
    default: chrome(["--no-sandbox", "--disable-gpu"]),
    chrome: chrome(["--no-sandbox", "--disable-gpu"]),
    ci: chrome(["--headless","--no-sandbox", "--disable-gpu"])
  }
};
