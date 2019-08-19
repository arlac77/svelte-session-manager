import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import http from "http";
import handler from "serve-handler";
import pkg from "../package.json";

const port = pkg.config.port || 5000;

const development = process.env.ROLLUP_WATCH;

if (development) {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "example/public",
      rewrites: [{ source: "**", destination: "/index.html" }]
    });
  });

  server.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
  });
}

export default {
  input: "example/src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: `example/public/bundle.mjs`
  },
  plugins: [
    resolve({ browser: true }),
    svelte(),
    development && livereload("example/public")
  ]
};
