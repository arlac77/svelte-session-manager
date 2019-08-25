import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import http from "http";
import { readFileSync } from "fs";
import jsonwebtoken from "jsonwebtoken";
import handler from "serve-handler";
import pkg from "../package.json";

const port = pkg.config.port || 5000;

const development = process.env.ROLLUP_WATCH;

if (development) {
  const server = http.createServer(async (request, response) => {
    if (request.method === "POST") {
      if (request.url === "/login") {
        const buffers = [];

        for await (const chunk of request) {
          buffers.push(chunk);
        }
        const content = JSON.parse(Buffer.concat(buffers).toString("utf8"));
        const ok =
          content.username.startsWith("user") && content.password === "secret1";

        if (ok) {
          response.writeHead(200, { "Content-Type": "application/json" });
          const access_token = jsonwebtoken.sign(
            { entitlements: ["a", "b", "c"].join(",") },
            readFileSync("example/demo.rsa"),
            {
              algorithm: "RS256",
              expiresIn: "15s"
            }
          );

          setTimeout(
            () => response.end(JSON.stringify({ access_token })),
            content.username === "userSlowLogin" ? 2000 : 500
          );
        } else {
          response.writeHead(401, { "Content-Type": "text/plain" });
          response.end("ok");
        }
      } else {
        response.setHeader("Content-Type", "text/html");
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("ok");
      }

      return;
    }

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
