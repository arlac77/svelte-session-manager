<script>
  import {Login, session} from '../../src/index.svelte';

  let context = {};
  
  $: username = $session.username;

</script>

<div>
  <h1>Example</h1>

  <Login context={context} endpint="somewhere"/>



  <h3>Session</h3>
  <div id="session_username">{username}</div>
</div>
