<script>
  import { Login, Session } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  if (!localStorage.endpoint) {
    localStorage.endpoint = api;
  }

  let endpoint = $state(localStorage.endpoint);

  export const session = new Session(localStorage);

  let resultCalled = $state(false);

  function result() {
    resultCalled = true;
  }

  function logoff(event) {
    event.preventDefault();
    session.invalidate();
  }

</script>

<div>
  <table>
    <colgroup>
      <col class="user" />
      <col class="password" />
      <col class="result" />
    </colgroup>
    <thead>
      <tr>
        <th>Username</th>
        <th>Password</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>user</td>
        <td>secret</td>
        <td>valid</td>
      </tr>
      <tr>
        <td>userSlowLogin</td>
        <td>secret</td>
        <td>valid but takes some time</td>
      </tr>
      <tr>
        <td>error 502 html</td>
        <td>any</td>
        <td>502 reported as html</td>
      </tr>
    </tbody>
  </table>

  <fieldset>
    <label for="url">
      Auth API
      <input
        type="url"
        name="url"
        id="url"
        placeholder="https://example.com"
        pattern="http?://.*"
        size="60"
        required
        bind:value={endpoint}
      />
    </label>
  </fieldset>


  {#snippet footerComponent(username,password,active)}
  <div class="button-group">
    <button id="create" aria-keyshortcuts="shift+Enter"
      >Create Account</button
    >
    <button id="lost-passwrod">Lost Password</button>
  </div>
  {/snippet}

  {#if !$session.isValid}
    <div class="modal center">
      <div class="window">
        <Login {session} {endpoint} {result} {footerComponent}>
        </Login>
      </div>
    </div>
  {/if}

  <form onsubmit={logoff}>
    <button id="logoff" type="submit" disabled={!$session.isValid}>
      Logoff
    </button>
  </form>
  {resultCalled ? "RESULT CALLED" : "NOT CALLED"}
  <h3>Session Details</h3>
  <table class="bordered">
    <colgroup>
      <col class="key" />
      <col class="value" />
    </colgroup>
    <tbody>
      <tr>
        <td>Subscriptions</td>
        <td id="session_subscriptions">{$session.subscriptions.size}</td>
      </tr>
      <tr>
        <td>Username</td>
        <td id="session_username">{$session.username || ""}</td>
      </tr>
      <tr>
        <td>Expires</td>
        <td id="session_expires">{$session.expirationDate.toISOString()}</td>
      </tr>
      <tr>
        <td>Validity</td>
        <td id="session_validity">{$session.isValid ? "valid" : "invalid"}</td>
      </tr>
      <tr>
        <td>Access Token</td>
        <td id="session_acccess_token">{$session.access_token || ""}</td>
      </tr>
      <tr>
        <td>Refresh Token</td>
        <td id="session_refresh_token">{$session.refresh_token || ""}</td>
      </tr>
      <tr>
        <td>Entitlements</td>
        <td id="session_entitlements">
          {[...$session.entitlements].join(",")}
        </td>
      </tr>
      <tr>
        <td>Authorization Header</td>
        <td id="session_authorization_header">
          {JSON.stringify($session.authorizationHeader)}
        </td>
      </tr>
    </tbody>
  </table>
</div>
