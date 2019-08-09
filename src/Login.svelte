<script>
  import { onDestroy } from "svelte";
  import { login, session } from "./session.mjs";

  export let context;
  export let endpoint;

  let username;
  let password = "";

  let active = false;

  async function submit() {
    try {
      active = true;
      await login(endpoint, username, password);
      context.router.push("/");
    } finally {
      active = false;
      password = "";
    }
  }

  $: username = $session.username;
</script>

<form on:submit|preventDefault={submit}>
  <fieldset>
    <label>Username</label>
    <input
      type="text"
      placeholder="Username"
      name="username"
      bind:value={username} />
  </fieldset>

  <fieldset>
    <label>Password</label>
    <input
      type="password"
      placeholder="Password"
      name="password"
      bind:value={password} />
  </fieldset>

  <button type="submit" class:active disabled={!username || !password}>
    Login
  </button>
</form>
