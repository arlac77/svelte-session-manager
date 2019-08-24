<script>
  import { Login, session } from "../../src/index.svelte";
</script>

<div>
  <h1>Example</h1>

  <div class="center">
    <Login endpoint="login" />
  </div>

  <h3>Session Details</h3>
  <table class="bordered">
    <tbody>
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
    </tbody>
  </table>
</div>
