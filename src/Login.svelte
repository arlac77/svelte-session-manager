<script>
  import { login } from "./login.mjs";

  export let endpoint;
  export let session;
  export let result;

  let username = "";
  let password = "";

  let active = false;
  let message;

  async function submit() {
    try {
      message = undefined;
      active = true;
      await login(session, endpoint, username, password);
    } catch (e) {
      message = e;
    } finally {
      if(result !== undefined) {
        await result();
      }
      active = false;
      password = "";
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  {#if message}
    <slot name="message">
      <div class="error" id="message">{message}</div>
    </slot>
  {/if}

  <slot name="inputs">
    <label for="username">
      Username
      <input
        aria-label="username"
        aria-required="true"
        maxlength="75"
        autocorrect="off"
        autocapitalize="off"
        id="username"
        type="text"
        placeholder="Username"
        name="username"
        required
        disabled={active}
        bind:value={username} />
    </label>
    <label for="password">
      Password
      <input
        aria-label="password"
        aria-required="true"
        autocorrect="off"
        autocapitalize="off"
        id="password"
        type="password"
        placeholder="Password"
        name="password"
        required
        disabled={active}
        bind:value={password} />
    </label>
  </slot>

  <slot name="submit">
    <button autofocus id="submit" type="submit" disabled={!username || !password}>
      Login
      {#if active}
        <div class="spinner" />
      {/if}
    </button>
  </slot>
</form>
