<script>
  import { Login, Session } from "../../../src/index.svelte";

  export const session = new Session(localStorage);

  let resultCalled = false;

  function result() {
    resultCalled = true;
  }
</script>

<div>
  <table>
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

  {#if !$session.isValid}
    <div class="modal center">
      <div class="window">
        <Login {session} endpoint="/api/login" {result}>
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
  {resultCalled ? 'RESULT CALLED' : 'NOT CALLED'}
  <h3>Session Details</h3>
  <table class="bordered">
    <tbody>
      <tr>
        <td class="key">Subscriptions</td>
        <td class="value" id="session_subscriptions">{$session.subscriptions.size}</td>
      </tr>
      <tr>
        <td class="key">Username</td>
        <td class="value" id="session_username">{$session.username ? $session.username : ""}</td>
      </tr>
      <tr>
        <td class="key">Expires</td>
        <td class="value" id="session_expires">{$session.expirationDate}</td>
      </tr>
      <tr>
        <td class="key">Validity</td>
        <td class="value" id="session_validity">{$session.isValid ? 'valid' : 'invalid'}</td>
      </tr>
      <tr>
        <td class="key">Access Token</td>
        <td class="value" id="session_acccess_token">{$session.access_token ? $session.access_token : ''}</td>
      </tr>
      <tr class="key">
        <td>Refresh Token</td>
        <td class="value" id="session_refresh_token">{$session.refresh_token}</td>
      </tr>
      <tr>
        <td class="key">Entitlements</td>
        <td class="value" id="session_entitlements">
          {[...$session.entitlements].join(',')}
        </td>
      </tr>
      <tr>
        <td class="key">Authorization Header</td>
        <td class="value" id="session_authorization_header">
          {JSON.stringify($session.authorizationHeader)}
        </td>
      </tr>
    </tbody>
  </table>
</div>
