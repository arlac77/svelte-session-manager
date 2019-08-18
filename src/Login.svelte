<script>
  import { login, session } from "./session.mjs";

  export let context;
  export let endpoint;

  let username = "";
  let password = "";

  let active = false;

  async function submit() {
    try {
      active = true;
      await login(endpoint, username, password);
     // context.router.push("/");
    } finally {
      active = false;
      password = "";
    }
  }

//  $: username = $session.username;
</script>

<form on:submit|preventDefault={submit}>
  <slot name="inputs">
    <fieldset>
      <label>Username</label>
      <input
        id="username"
        type="text"
        placeholder="Username"
        name="username"
        bind:value={username} />
    </fieldset>

    <fieldset>
      <label>Password</label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        name="password"
        bind:value={password} />
    </fieldset>
  </slot>

  <slot name="submit">
    <button id="submit" type="submit" class:active disabled={!username || !password}>
      Login
    </button>
  </slot>
</form>
