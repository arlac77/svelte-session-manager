<script>
  import {Login, session} from '../../src/index.svelte';

</script>

<div>
  <h1>Example</h1>

  <Login endpoint="login"/>

  <h3>Session</h3>
  <div id="session_username">{$session.username}</div>
  <div id="session_validity">{$session.isValid ? 'valid' : 'invalid'}</div>
</div>
