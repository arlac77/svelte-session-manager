const jsonwebtoken = require("jsonwebtoken");
const { readFileSync } = require("fs");

exports.handler = async (event, context) => {
  const access_token = jsonwebtoken.sign(
    { entitlements: ["a", "b", "c"].join(",") },
    readFileSync(join(__dirname__, "demo.rsa")),
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
