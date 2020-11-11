/**
 * Bring session into the valid state by calling the authorization endpoint
 * and asking for a access_token.
 * Executes a POST on the endpoint url expecting username, and password as json
 * @param {Session} session to be opened
 * @param {string} endpoint authorization url
 * @param {string} username id of the user
 * @param {string} password user credentials
 * @return {string} error message in case of failure or undefined on success
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
      if(!data.access_token) {
        return "missing access_token";
      }

      session.update({ username, access_token: data.access_token });
      session.save();
    } else {
      session.update({ username });
      return handleFailedResponse(response);
    }
  } catch (e) {
    session.update({ username });
    throw e;
  }
}

/**
 * Extract error description from response
 * @param {FetchResponse} response
 * @return {string}
 */
export async function handleFailedResponse(response) {
  const wa = response.headers.get("WWW-Authenticate");

  if (wa) {
    const o = Object.fromEntries(
      wa.split(/\s*,\s*/).map(entry => entry.split(/=/))
    );
    if (o.error_description) {
      return o.error_description;
    }
  }

  let message = response.statusText;

  const ct = response.headers.get("Content-Type").replace(/;.*/, "");

  switch (ct) {
    case "text/plain":
      message += "\n" + (await response.text());
      break;
    case "text/html":
      const root = document.createElement("html");
      root.innerHTML = await response.text();

      for (const tag of ["title", "h1", "h2"]) {
        for (const item of root.getElementsByTagName(tag)) {
          const text = item.innerText;
          if (text) {
            return text;
          }
        }
      }
      break;
  }

  return message;
}
