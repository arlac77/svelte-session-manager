import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";

import http from "http";
import handler from "serve-handler";

const port = 5000;

if (process.env.ROLLUP_WATCH) {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "public"
    });
  });

  server.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
  });
}

export default {
  input: "src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: `public/bundle.mjs`
  },
  plugins: [resolve(), svelte()]
};
