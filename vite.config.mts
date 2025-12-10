import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { extractFromPackage } from "npm-pkgbuild";
import { readFileSync } from "node:fs";
import jsonwebtoken from "jsonwebtoken";

export default defineConfig(async ({ command, mode }) => {
  const res = extractFromPackage(
    {
      dir: new URL("./", import.meta.url).pathname,
      mode
    },
    process.env
  );
  const first = await res.next();
  const pkg = first.value;
  const properties = pkg.properties;
  const base = ""; //properties["http.path"];
  const production = mode === "production";

  process.env["VITE_NAME"] = properties.name;
  process.env["VITE_DESCRIPTION"] = properties.description;
  process.env["VITE_VERSION"] = properties.version;
  process.env["VITE_API"] = properties.api;

  return {
    base,
    root: "tests/app/src",
    plugins: [
      myServerPlugin(),
      svelte({
        compilerOptions: {
          dev: !production
        }
      }),
      compression({
        algorithms: ["brotliCompress"],
        exclude: [
          /\.(map)$/,
          /\.(br)$/,
          /\.(gz)$/,
          /\.(png)$/,
          /\.(jpg)$/,
          /\.(gif)$/,
          /\.(webp)$/,
          /\.(heic)$/,
          /\.(avif)$/,
          /\.(jxl)$/,
          /\.(pdf)$/,
          /\.(docx)$/
        ],
        threshold: 500
      })
    ],
    server: { host: true },
    build: {
      outDir: "../../../build",
      emptyOutDir: true,
      minify: production,
      sourcemap: true
    }
  };
});

const myServerPlugin = () => ({
  name: "configure-server",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.method === "POST" && req.url.indexOf("api/login") >= 0) {
        const buffers = [];

        for await (const chunk of req) {
          buffers.push(chunk);
        }

        const content = JSON.parse(Buffer.concat(buffers).toString("utf8"));

        const expires = 10;
        const refreshExpires = 3600;

        function entitlements(username) {
          return username === undefined ||
            username.toLowerCase().includes("no_entitlements")
            ? ""
            : ["a", "b", "c"].join(",");
        }

        function accessToken(username, expires) {
          const scope = entitlements(username);
          return jsonwebtoken.sign(
            scope.length
              ? { name: username, entitlements: scope }
              : { name: username },
            readFileSync("tests/app/demo.rsa"),
            {
              algorithm: "RS256",
              expiresIn: `${expires}s`
            }
          );
        }

        function refreshToken(expires = 3600) {
          return jsonwebtoken.sign(
            { sequence: 1 },
            readFileSync("tests/app/demo.rsa"),
            {
              algorithm: "RS256",
              expiresIn: `${expires}s`
            }
          );
        }

        let body, type;
        let status = 200;
        const token_type = "bearer";

        if (content.grant_type === "refresh_token" && content.refresh_token) {
          body = {
            username: content.username,
            token_type,
            expires_in: expires,
            access_token: accessToken(content.username, expires),
            refresh_token: refreshToken(refreshExpires)
          };
        } else if (
          content.username?.startsWith("user") &&
          content.password === "secret"
        ) {
          body = {
            token_type,
            expires_in: expires,
            scope: entitlements(content.username),
            access_token: accessToken(content.username, expires)
          };

          if (!content.username.toLowerCase().includes("no_refresh_token")) {
            body.refresh_token_expires_in = refreshExpires;
            body.refresh_token = refreshToken(refreshExpires);
          }

          await new Promise(resolve =>
            setTimeout(
              resolve,
              content.username.toLowerCase().includes("slow") ? 2000 : 500
            )
          );
        } else {
          function message(n) {
            const messages = {
              400: "Bad Request",
              401: "Unauthorized",
              500: "Internal Server Error",
              502: "Bad Gateway"
            };
            return messages[n] || "Unknown";
          }

          status = 401;

          const m = content.username?.match(/^error\s*(\d+)(\s+([\w\-]+))?/);
          if (m) {
            status = parseInt(m[1]);

            switch (m[3]) {
              case "json":
                type = "application/json";
                body = { key: "value" };
                break;
              case "html":
                type = "text/html";
                body = `<html><head><title>#HT ${message(
                  status
                )}</title></head><body><center><h1>#H ${message(
                  status
                )}</h1></center><center>nginx/1.17.4</center></body></html>`;
                break;
              case "WWW-Authenticate":
                const values = [
                  'Bearer realm="example"',
                  'error="invalid_token"',
                  `error_description="#W ${message(status)}"`
                ];
                res.setHeader("WWW-Authenticate", values.join(" "));
                body = "WWW-Authenticate " + message(status);
                break;
              default:
                body = "#T " + message(status);
            }
          } else {
            body = { message: message(status) };
          }
        }

        res.statusCode = status;

        if (!type) {
          type = typeof body === "string" ? "text" : "application/json";
        }

        res.setHeader("Content-Type", type);
        res.end(typeof body === "string" ? body : JSON.stringify(body));

        return;
      }
      next();
    });
  }
});
