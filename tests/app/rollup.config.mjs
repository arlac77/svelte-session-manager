import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import virtual from "@rollup/plugin-virtual";
import { readFileSync } from "fs";
import jsonwebtoken from "jsonwebtoken";

const basedir = "tests/app";
const port = 5000;

export default {
  input: `${basedir}/src/index.mjs`,
  output: {
    sourcemap: true,
    format: "esm",
    file: `${basedir}/public/bundle.main.mjs`
  },
  plugins: [
    virtual({
      "node-fetch": "export default fetch",
      stream: "export class Readable {}",
      buffer: "export class Buffer {}"
    }),
    svelte(),
    postcss(),
    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    }),
    dev({
      port,
      dirs: [`${basedir}/public`],
      spa: `${basedir}/public/index.html`,
      basePath: "/",
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
              const scope = content.username.toLowerCase().includes("no_entitlements") ?
                    "" :
                    ["a", "b", "c"].join(",");
                 
              const body = {
                token_type: "bearer",
                scope,
                access_token: jsonwebtoken.sign(
                  scope.length ? { entitlements: scope } : {},
                  readFileSync("tests/app/demo.rsa"),
                  {
                    algorithm: "RS256",
                    expiresIn: "8s"
                  }
                )
              };

              if (
                !content.username.toLowerCase().includes("no_refresh_token")
              ) {
                body.refresh_token = jsonwebtoken.sign(
                  {},
                  readFileSync("tests/app/demo.rsa"),
                  {
                    algorithm: "RS256",
                    expiresIn: "20s"
                  }
                );
              }

              await new Promise(resolve =>
                setTimeout(
                  resolve,
                  content.username.toLowerCase().includes("slow") ? 2000 : 500
                )
              );

              ctx.body = body;
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
                  case "json":
                    ctx.type = "application/json";
                    ctx.body = { key: "value" };
                    break;
                  case "html":
                    ctx.type = "text/html";
                    ctx.body = `<html><head><title>#HT ${message(
                      status
                    )}</title></head><body><center><h1>#H ${message(
                      status
                    )}</h1></center><center>nginx/1.17.4</center></body></html>`;
                    break;
                  case "WWW-Authenticate":
                    ctx.set("WWW-Authenticate", 'Bearer realm="example"');
                    ctx.append("WWW-Authenticate", 'error="invalid_token"');
                    ctx.append(
                      "WWW-Authenticate",
                      `error_description="#W ${message(status)}"`
                    );
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
    })
  ]
};
