export class Session {
  constructor(data) {
    let expirationTimer;

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
      expirationTimer: {
        get: () => expirationTimer,
        set: v => (expirationTimer = v)
      }
    });

    this.update(data);
  }

  update(data) {
    this.entitlements.clear();
    this.expirationDate.setTime(0);
    this.username = undefined;
    this.access_token = undefined;

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = undefined;
    }

    if (data !== undefined) {
      this.username = data.username !== "undefined" ? data.username : undefined;
      this.access_token = data.access_token;

      const decoded = decode(data.access_token);

      if (decoded) {
        decoded.entitlements.split(/,/).forEach(e => this.entitlements.add(e));

        this.expirationDate.setUTCSeconds(decoded.exp);

        const expiresInMilliSeconds =
          this.expirationDate.valueOf() - new Date().valueOf();

        if(expiresInMilliSeconds > 0) {
          this.expirationTimer = setTimeout(() => {
            this.expirationTimer = undefined;
            this.fire();
          }, expiresInMilliSeconds);
        }
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

  /**
   * As long as the expirationTimer is running we must be valid
   */
  get isValid() {
    return this.expirationTimer !== undefined;
  }

  /**
   * remove all tokens from the session and the backing store
   */
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

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}
