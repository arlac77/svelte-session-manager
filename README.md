[![Svelte v3](https://img.shields.io/badge/svelte-v3-orange.svg)](https://svelte.dev)
[![npm](https://img.shields.io/npm/v/svelte-session-manager.svg)](https://www.npmjs.com/package/svelte-session-manager)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/svelte-session-manager)](https://bundlephobia.com/result?p=svelte-session-manager)
[![downloads](http://img.shields.io/npm/dm/svelte-session-manager.svg?style=flat-square)](https://npmjs.org/package/svelte-session-manager)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/svelte-session-manager.svg?style=flat-square)](https://github.com/arlac77/svelte-session-manager/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fsvelte-session-manager%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/svelte-session-manager/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/svelte-session-manager/badge.svg)](https://snyk.io/test/github/arlac77/svelte-session-manager)
[![Coverage Status](https://coveralls.io/repos/arlac77/svelte-session-manager/badge.svg)](https://coveralls.io/github/arlac77/svelte-session-manager)
[![Tested with TestCafe](https://img.shields.io/badge/tested%20with-TestCafe-2fa4cf.svg)](https://github.com/DevExpress/testcafe)
[![Netlify Status](https://api.netlify.com/api/v1/badges/57021a61-08a4-441d-a216-31d0167fff02/deploy-status)](https://app.netlify.com/sites/svelte-session-manager/deploys)

# svelte-session-manager

Session store for svelte (currently only for JWT)

# usage

```js
import { derived } from 'svelte';
import { Session, login } from 'svelte-session-manager';

// use localStorage as backing store
let session = new Session(localStorage);

// session may still be valid
if(!session.isValid) {
  await login(session, 'https://mydomain.com/authenticate', 'a user', 'a secret');
}

session.isValid; // true when auth was ok or localStorage token is still valid


export const values = derived(
  session,
  ($session, set) => {
    if (!session.isValid) {
      set([]); // session has expired no more data
    } else {
      fetch('https://mydomain.com/values', {
        headers: {
          ...session.authorizationHeader
        }
      }).then(async data => set(await data.json()));
    }
    return () => {};
  }
,[]);

// $values contains fetch result as long as session has not expired
```

## run tests

```sh
export BROWSER=safari|chrome|...
npm|yarn test
```

The test runs the following requests against the server

*   successful auth

```sh
curl -X POST -d '{"username":"user","password":"secret"}' 'http://[::]:5000/api/login'
```

    {"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRpdGxlbWVudHMiOiJhLGIsYyIsImlhdCI6MTYwNDY2NDI0NywiZXhwIjoxNjA0NjY0MjYyfQ.qyjeoCuXO0iyYwSxM2sM02_BVhaZobRmEWam1M8Hzkx51nbsAuTR8G1rNgz1COo_KvbCU7LwZt7qnSEFB1tcwyDA1eBxwc2Wb7JxWgQ50m1IWkr2JCgY1seWRJRcwZBXiTRtiPqhzofP-l3S-CBluzU48cd4yzoPayczLkKuPK4"}

*   invalid credentials

```sh
curl -X POST -d '{"username":"user","password":"wrong"}' 'http://[::]:5000/api/login'
```

    {"message":"Unauthorized"}

## Live Example

[live example](https://svelte-session-manager.netlify.app/tests/app/)

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [login](#login)
    *   [Parameters](#parameters)
*   [handleFailedResponse](#handlefailedresponse)
    *   [Parameters](#parameters-1)
*   [SessionData](#sessiondata)
    *   [Properties](#properties)
*   [Session](#session)
    *   [Parameters](#parameters-2)
    *   [Properties](#properties-1)
    *   [clear](#clear)
    *   [save](#save)
    *   [authorizationHeader](#authorizationheader)
    *   [isValid](#isvalid)
    *   [invalidate](#invalidate)
    *   [hasEntitlement](#hasentitlement)
        *   [Parameters](#parameters-3)
    *   [subscribe](#subscribe)
        *   [Parameters](#parameters-4)

## login

Bring session into the valid state by calling the authorization endpoint
and asking for a access_token.
Executes a POST on the endpoint url expecting username, and password as json

### Parameters

*   `session` **[Session](#session)** to be opened
*   `endpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** authorization url
*   `username` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** id of the user
*   `password` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** user credentials
*   `tokenmap` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** token names in response to internal known values (optional, default `{access_token:"access_token",refresh_token:"refresh_token"}`)

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** error message in case of failure or undefined on success

## handleFailedResponse

Extract error description from response

### Parameters

*   `response` **FetchResponse** 

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## SessionData

Data as preserved in the backing store

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `username` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** user name (id)
*   `access_token` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** JWT token
*   `refresh_token` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** JWT token

## Session

User session
To create as session backed by browser local storage

```js
let session = new Session(localStorage);
```

or by browser session storage

```js
let session = new Session(sessionStorage);
```

### Parameters

*   `data` **[SessionData](#sessiondata)** 

### Properties

*   `entitlements` **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** 
*   `subscriptions` **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** store subscriptions
*   `expirationDate` **[Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)** 
*   `access_token` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** token itself
*   `refresh_token` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** refresh token
*   `store` **[SessionData](#sessiondata)** backing store to use for save same as data param

### clear

Invalidate session data.

### save

Persist into the backing store.

### authorizationHeader

Http header suitable for fetch.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** header The http header.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** header.Authorization The Bearer access token.

### isValid

As long as the expirationTimer is running we must be valid.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if session is valid (not expired)

### invalidate

Remove all tokens from the session and the backing store.

### hasEntitlement

Check presence of an entitlement.

#### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** of the entitlement

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the named entitlement is present

### subscribe

Fired when the session changes.

#### Parameters

*   `subscription` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

# install

With [npm](http://npmjs.org) do:

```shell
npm install svelte-session-manager
```

# license

BSD-2-Clause
