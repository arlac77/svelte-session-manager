import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import { readFileSync } from "fs";
import jsonwebtoken from "jsonwebtoken";
import pkg from "../package.json";

const port = pkg.config.port || 5000;

export default {
  input: "example/src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: `example/public/bundle.mjs`
  },
  plugins: [
    dev({
      port,
      dirs: ["example/public"],
      spa: "example/public/index.html",
      basePath: "/base",
      extend(app, modules) {
        app.use(
          modules.router.post("/api/login", async (ctx, next) => {
            const buffers = [];

            for await (const chunk of ctx.req) {
              buffers.push(chunk);
            }

            const content = JSON.parse(Buffer.concat(buffers).toString("utf8"));
            if (
              content.username.startsWith("user") &&
              content.password === "secret"
            ) {
              const access_token = jsonwebtoken.sign(
                { entitlements: ["a", "b", "c"].join(",") },
                readFileSync("example/demo.rsa"),
                {
                  algorithm: "RS256",
                  expiresIn: "15s"
                }
              );

              await new Promise(resolve =>
                setTimeout(
                  () => resolve(),
                  content.username === "userSlowLogin" ? 2000 : 500
                )
              );

              ctx.body = { access_token };
            } else {
              if (content.username.startsWith("error")) {
                ctx.status = 502;
                ctx.type = 'text/html';
                ctx.body = "<html><head><title>Bad Gateway 502</title></head><body>Communication Error</body></html>";
                ctx.throw(502, "Bad Gateway");
              } else {
                ctx.status = 401;
                ctx.body = { message: "forbidden" };
                ctx.throw(401, "Unauthorized");
              }
            }
            next();
          })
        );
      }
    }),
    resolve({ browser: true }),
    svelte()
  ]
};
