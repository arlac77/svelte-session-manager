<script>
  import { Login, Session } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  let endpoint = api;

  export const session = new Session(localStorage);

  let resultCalled = false;

  function result() {
    resultCalled = true;
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
      <th>Username</th>
      <th>Password</th>
      <th>Result</th>
    </thead>
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

  {#if !$session.isValid}
    <div class="modal center">
      <div class="window">
        <Login {session} {endpoint} {result}>
          <div slot="footer">
            <a href="somewhere">create account</a>
            <a href="somewhere">lost password</a>
          </div>
        </Login>
      </div>
    </div>
  {/if}

  <form on:submit|preventDefault={() => session.invalidate()}>
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
