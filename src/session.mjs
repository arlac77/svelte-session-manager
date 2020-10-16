
/**
 * Data as preserved in the backing store
 * @typedef {Object} SessionData
 * @property {string} username user name (id)
 * @property {string} access_token JWT token
 */

/**
 * User session
 * To create as session backed by browser local storage
 * ```js
 * let session = new Session(localStorage);
 * ```
 * or by browser session storage
 * ```js
 * let session = new Session(sessionStorage);
 * ```
 * @param {SessionData} data
 * @property {Set<string>} entitlements
 * @property {Set<Object>} subscriptions store subscriptions
 * @property {Date} expirationDate
 * @property {string} access_token token itself
 * @property {SessionData} store backing store to use for save same as data param
 */
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

  /**
   * Invalidate session data
   */
  clear() {
    this.entitlements.clear();
    this.expirationDate.setTime(0);
    this.username = undefined;
    this.access_token = undefined;
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = undefined;
    }
  }

  update(data) {
    this.clear();

    if (data !== undefined) {
      this.username = data.username !== "undefined" ? data.username : undefined;
      this.access_token = data.access_token;

      const decoded = decode(data.access_token);

      if (decoded) {
        this.expirationDate.setUTCSeconds(decoded.exp);

        const expiresInMilliSeconds =
          this.expirationDate.valueOf() - Date.now();

        if(expiresInMilliSeconds > 0) {
          if(decoded.entitlements) {
            decoded.entitlements.split(/,/).forEach(e => this.entitlements.add(e));
          }

          this.expirationTimer = setTimeout(() => {
            this.clear();
            this.fire();
          }, expiresInMilliSeconds);
        }
      }
    }

    this.fire();
  }

  /**
   * Persist into the backing store
   */
  save() {
    if (this.username === undefined) {
      delete this.store.access_token;
      delete this.store.username;
    } else {
      this.store.access_token = this.access_token;
      this.store.username = this.username;
    }
  }

  /**
   * http header suitable for fetch
   * @return {Object} header The http header.
   * @return {string} header.Authorization The Bearer access token.
   */
  get authorizationHeader() {
    return { Authorization: "Bearer " + this.access_token };
  }

  /**
   * As long as the expirationTimer is running we must be valid
   * @return {boolean} true if session is valid (not expired)
   */
  get isValid() {
    return this.expirationTimer !== undefined;
  }

  /**
   * Remove all tokens from the session and the backing store
   */
  invalidate() {
    this.update();
    this.save();
  }

  /**
   * Check presence of an entilement.
   * @param {string} name of the entitlement
   * @return {boolean} true if the named entitlement is present
   */ 
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

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}
