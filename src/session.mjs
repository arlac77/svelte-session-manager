/**
 * Data as preserved in the backing store
 * @typedef {Object} SessionData
 * @property {string} username user name (id)
 * @property {string} access_token JWT token
 * @property {string} refresh_token JWT token
 */

const storeKeys = ["username", "access_token", "refresh_token"];

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
 * @property {Date} expirationDate when the access token expires
 * @property {string} access_token token itself
 * @property {string} refresh_token refresh token
 * @property {Date} refreshDate when the refresh token expires
 * @property {SessionData} store backing store to use for save same as data param
 */
export class Session {
  constructor(data) {
    let expirationTimer;
    let refreshTimer;

    Object.defineProperties(this, {
      store: {
        get: () => data,
        set: v => (data = v)
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
      },
      refreshDate: {
        value: new Date(0)
      },
      refreshTimer: {
        get: () => refreshTimer,
        set: v => (refreshTimer = v)
      }
    });

    this.update(data);
  }

  /**
   * Invalidate session data.
   */
  clear() {
    this.entitlements.clear();
    this.expirationDate.setTime(0);
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = undefined;
    }

    for (const key of storeKeys) {
      delete this[key];
    }
  }

  update(data) {
    this.clear();

    if (data !== undefined) {
      for (const key of storeKeys) {
        if(data[key] === undefined) {
          delete this[key];
        }
        else {
          this[key] = data[key];
        }
      }
  
      const decoded = decode(data.access_token);

      if (decoded) {
        this.expirationDate.setUTCSeconds(decoded.exp);

        const expiresInMilliSeconds =
          this.expirationDate.valueOf() - Date.now();

        if (expiresInMilliSeconds > 0) {
          if (decoded.entitlements) {
            decoded.entitlements
              .split(/,/)
              .forEach(e => this.entitlements.add(e));
          }

          this.expirationTimer = setTimeout(() => {
            this.clear();
            this.emit();
          }, expiresInMilliSeconds);
        }
      }

      if(data.refresh_token) {
        const decoded = decode(data.refresh_token);
        if (decoded) {
          this.refreshDate.setUTCSeconds(decoded.exp);
          const expiresInMilliSeconds =
          this.refreshDate.valueOf() - Date.now();
          if (expiresInMilliSeconds > 0) {  
            this.refreshTimer = setTimeout(() => {
              this.refresh();
            }, expiresInMilliSeconds);
          }
        }
      }
    }

    this.emit();
  }

  refresh() {
    console.log("not implemented");
  }

  /**
   * Persist into the backing store.
   */
  save() {
    for (const key of storeKeys) {
      if (this.username === undefined) {
        delete this.store[key];
      } else {
        this.store[key] = this[key];
      }
    }
  }

  /**
   * Http header suitable for fetch.
   * @return {Object} header The http header.
   * @return {string} header.Authorization The Bearer access token.
   */
  get authorizationHeader() {
    return this.isValid ? { Authorization: "Bearer " + this.access_token } : {};
  }

  /**
   * As long as the expirationTimer is running we must be valid.
   * @return {boolean} true if session is valid (not expired)
   */
  get isValid() {
    return this.expirationTimer !== undefined;
  }

  /**
   * Remove all tokens from the session and the backing store.
   */
  invalidate() {
    this.update();
    this.save();
  }

  /**
   * Check presence of an entitlement.
   * @param {string} name of the entitlement
   * @return {boolean} true if the named entitlement is present
   */
  hasEntitlement(name) {
    return this.entitlements.has(name);
  }

  emit() {
    this.subscriptions.forEach(subscription => subscription(this));
  }

  /**
   * Fired when the session changes.
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
