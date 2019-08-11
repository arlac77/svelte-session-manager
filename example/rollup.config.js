import handler from "serve-handler";

import http from "http";
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: `public/bundle.mjs`
  },
  plugins: [resolve(), svelte()]
};
