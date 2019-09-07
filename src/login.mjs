
/**
 * @param {Session} session
 */
export async function login(session, endpoint, username, password) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    if (response.ok) {
      const data = await response.json();
      session.update({ username, access_token: data.access_token });
      session.save();
    } else {
      session.update({ username });

      let message = response.statusText;

      const ct = response.headers.get("Content-Type");

      switch (ct) {
        case "text/plain":
          message += "\n" + (await response.text());
      }

      throw new Error(message);
    }
  } catch (e) {
    session.update({ username });
    throw e;
  }
}
