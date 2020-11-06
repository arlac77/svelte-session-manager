[![Svelte v3](https://img.shields.io/badge/svelte-v3-orange.svg)](https://svelte.dev)
[![npm](https://img.shields.io/npm/v/svelte-session-manager.svg)](https://www.npmjs.com/package/svelte-session-manager)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/svelte-session-manager)](https://bundlephobia.com/result?p=svelte-session-manager)
[![downloads](http://img.shields.io/npm/dm/svelte-session-manager.svg?style=flat-square)](https://npmjs.org/package/svelte-session-manager)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/svelte-session-manager.git)

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

- successful auth
```sh
curl -X POST -d '{"username":"user","password":"secret"}' 'http://[::]:5000/api/login'
```
```
{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRpdGxlbWVudHMiOiJhLGIsYyIsImlhdCI6MTYwNDY2NDI0NywiZXhwIjoxNjA0NjY0MjYyfQ.qyjeoCuXO0iyYwSxM2sM02_BVhaZobRmEWam1M8Hzkx51nbsAuTR8G1rNgz1COo_KvbCU7LwZt7qnSEFB1tcwyDA1eBxwc2Wb7JxWgQ50m1IWkr2JCgY1seWRJRcwZBXiTRtiPqhzofP-l3S-CBluzU48cd4yzoPayczLkKuPK4"}
```

- invalid credentials
```sh
curl -X POST -d '{"username":"user","password":"wrong"}' 'http://[::]:5000/api/login'
```
```
{"message":"Unauthorized"}
```


# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Table of Contents

# install

With [npm](http://npmjs.org) do:

```shell
npm install svelte-session-manager
```

# license

BSD-2-Clause
