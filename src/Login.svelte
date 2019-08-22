<script>
  import { login, session } from "./session.mjs";

  export let endpoint;

  let username = "";
  let password = "";

  let active = false;
  let message;

  async function submit() {
    try {
      message = undefined;
      active = true;
      await login(endpoint, username, password);
    } catch (e) {
      message = e;
    } finally {
      active = false;
      password = "";
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  {#if message}
    <slot name="message">
      <div id="message">{message}</div>
    </slot>
  {/if}

  <slot name="inputs">
    <label for="username">
      Username
      <input
        id="username"
        type="text"
        placeholder="Username"
        name="username"
        bind:value={username} />
    </label>
    <label for="password">
      Password
      <input
        id="password"
        type="password"
        placeholder="Password"
        name="password"
        bind:value={password} />
    </label>
  </slot>

  <slot name="submit">
    <button
      id="submit"
      type="submit"
      class:active
      disabled={!username || !password}>
      Login
    </button>
  </slot>
</form>
