<script>
  import { login, session } from "./session.mjs";

  export let context;
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
     // context.router.push("/");
    } catch(e) {
      message = e;
    }
    finally {
      active = false;
      password = "";
    }
  }

//  $: username = $session.username;
</script>

<form on:submit|preventDefault={submit}>
  {#if message}
    <slot name="message">
    <div>
      {message}
    </div>
    </slot>
  {/if}
  
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
