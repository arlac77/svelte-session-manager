<script>
  import {Login, session} from '../../src/index.svelte';

  
  $: username = $session.username;

</script>

<div>
  <h1>Example</h1>

  <Login endpoint="somewhere"/>


  <h3>Session</h3>
  <div id="session_username">{username}</div>
</div>
