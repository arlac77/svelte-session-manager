
/**
 * Bring session into the valid state by calling the authorization endpoint
 * and asking for a access_token.
 * Executess a POST on the endpoint url providing username, and password as json
 * @param {Session} session to be opened
 * @param {string} endpoint authorization url
 * @param {string} username id of the user
 * @param {string} password user credentials
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

      const ct = response.headers.get("Content-Type").replace(/;.*/,'');
    
      switch (ct) {
        case "text/plain":
          message += "\n" + (await response.text());
        break;
        case "text/html":
          const el = document.createElement( 'html' );
          el.innerHTML = await response.text();
          const titles = el.getElementsByTagName( 'title' );
          message = titles.item(0).text;
        break;
      }

      throw new Error(message);
    }
  } catch (e) {
    session.update({ username });
    throw e;
  }
}
