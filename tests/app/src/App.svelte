<script>
  import { Login, Session } from "../../../src/index.svelte";

  export const session = new Session(localStorage);

  let resultCalled = false;

  function result() {
    resultCalled = true;
  }
</script>

<div>
  <h1>Example</h1>
  Username is
  <bold>user</bold>
  Password is
  <bold>secret</bold>

  {#if !$session.isValid}
  <div class="modal center">
    <div class="window">
      <Login {session} endpoint="/api/login" {result} />
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
        <td>Subscriptions</td>
        <td id="session_subscriptions">{$session.subscriptions.size}</td>
      </tr>
      <tr>
        <td>Username</td>
        <td id="session_username">{$session.username}</td>
      </tr>
      <tr>
        <td>Expires</td>
        <td id="session_expires">{$session.expirationDate}</td>
      </tr>
      <tr>
        <td>Validity</td>
        <td id="session_validity">{$session.isValid ? 'valid' : 'invalid'}</td>
      </tr>
      <tr>
        <td>Access Token</td>
        <td id="session_acccess_token">{$session.access_token}</td>
      </tr>
      <tr>
        <td>Entitlements</td>
        <td id="session_entitlements">
          {[...$session.entitlements].join(',')}
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
