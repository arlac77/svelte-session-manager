const { readFileSync } = require("fs");
const { join } = require("path");
const jsonwebtoken = require("jsonwebtoken");

exports.handler = async (event, context) => {
  const access_token = jsonwebtoken.sign(
    { entitlements: ["a", "b", "c"].join(",") },
    readFileSync(join(__dirname, "demo.rsa")),
    {
      algorithm: "RS256",
      expiresIn: "15s"
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      access_token
    })
  };
};
