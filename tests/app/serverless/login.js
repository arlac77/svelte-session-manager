export async function handler (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" })
  };
};
