const jsonwebtoken = require("jsonwebtoken");


exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World", sign: jsonwebtoken.sign ? "sing present" : "no sign"})
  };
};
