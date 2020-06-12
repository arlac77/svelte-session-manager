import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import { readFileSync } from "fs";
import jsonwebtoken from "jsonwebtoken";

const port = 5000;

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
                content.username === "user_no_entitlements"
                  ? {}
                  : { entitlements: ["a", "b", "c"].join(",") },
                readFileSync("example/demo.rsa"),
                {
                  algorithm: "RS256",
                  expiresIn: "15s"
                }
              );

              await new Promise(resolve =>
                setTimeout(
                  resolve,
                  content.username === "userSlowLogin" ? 2000 : 500
                )
              );

              ctx.body = { access_token };
            } else {
              function message(n) {
                const messages = {
                  400: "Bad Request",
                  401: "Unauthorized",
                  500: "Internal Server Error",
                  502: "Bad Gateway"
                };
                return messages[n] ? messages[n] : "Unknown";
              }
              let status = 401;

              const m = content.username.match(/^error\s*(\d+)(\s+([\w\-]+))?/);
              if (m) {
                status = parseInt(m[1]);

                switch (m[3]) {
                  case "html":
                    ctx.type = "text/html";
                    ctx.body = `<html><head><title>Title #H ${status} ${message(
                      status
                    )}</title></head><body><center><h1>#H ${status} ${message(
                      status
                    )}</h1></center><hr><center>nginx/1.17.4</center></body></html>`;
                    break;
                  case 'WWW-Authenticate'
                    ctx.set('WWW-Authenticate','Bearer realm="example"');
                    ctx.append('WWW-Authenticate','error="invalid_token"');
                    ctx.append('WWW-Authenticate',`error_description="#W ${message(status)}"`);  
                    ctx.body = "WWW-Authenticate " + message(status);
                    break;
                  default:
                    ctx.body = "#T " + message(status);
                }
              } else {
                ctx.body = { message: message(status) };
              }
              ctx.status = status;
              return;
            }
            next();
          })
        );
      }
    }),
    resolve.nodeResolve({ browser: true }),
    svelte()
  ]
};
