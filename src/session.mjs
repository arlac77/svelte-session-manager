export class Session {
  constructor(data) {
    let timeout;

    Object.defineProperties(this, {
      store: {
        value: data
      },
      subscriptions: {
        value: new Set()
      },
      entitlements: {
        value: new Set()
      },
      expirationDate: {
        value: new Date(0)
      },
      timeout: {
        get: () => timeout,
        set: v => (timeout = v)
      }
    });

    this.update(data);
  }

  update(data) {
    this.entitlements.clear();
    this.expirationDate.setTime(0);
    this.username = undefined;
    this.access_token = undefined;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    if (data !== undefined) {
      this.username = data.username !== undefined && data.username !== "undefined" ? data.username : undefined;
      this.access_token = data.access_token;

      const decoded = decode(data.access_token);

      if (decoded) {
        decoded.entitlements.split(/,/).forEach(e => this.entitlements.add(e));

        this.expirationDate.setUTCSeconds(decoded.exp);

        const expiresInMilliSeconds =
          this.expirationDate.valueOf() - new Date().valueOf();


        this.timeout = setTimeout(() => {
          this.timeout = undefined;
          this.fire();
        }, expiresInMilliSeconds);
      }
    }

    this.fire();
  }

  save() {
    if (this.username === undefined) {
      delete this.store.access_token;
      delete this.store.username;
    } else {
      this.store.access_token = this.access_token;
      this.store.username = this.username;
    }
  }

  get authorizationHeader() {
    return { Authorization: "Bearer " + this.access_token };
  }

  get isValid() {
    return this.expirationDate.valueOf() >= new Date().valueOf();
  }

  invalidate() {
    this.update();
    this.save();
  }

  hasEntitlement(name) {
    return this.entitlements.has(name);
  }

  fire() {
    this.subscriptions.forEach(subscription => subscription(this));
  }

  /**
   * Fired when the session changes
   * @param {Function} subscription
   */
  subscribe(subscription) {
    subscription(this);
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  }
}

export const session = new Session(localStorage);

export async function login(endpoint, username, password) {
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

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}
