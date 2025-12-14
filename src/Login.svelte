<script>
  import { login } from "./login.mjs";

  let {
    endpoint,
    session,
    result,
    submitComponent = defaultSubmitComponent,
    footerComponent = defaultFooterComponent,
    messageComponent = defaultMessageComponent
  } = $props();

  let username = $state("");
  let password = $state("");
  let enabled = $derived(username.length !== 0 && password.length !== 0);
  let active = $state(false);
  let message = $state();

  async function onsubmit(event) {
    event.preventDefault();
    if (!active) {
      try {
        active = true;
        message = await login(session, endpoint, username, password);
        if (!message && result !== undefined) {
          await result();
        }
      } catch (e) {
        message = e;
      } finally {
        active = false;
        password = "";
      }
    }
  }
</script>

{#snippet defaultFooterComponent(username, password, active)}
  <div></div>
{/snippet}

{#snippet defaultMessageComponent(mesage)}
  {#if message}
    <div class="error" id="message">{message}</div>
  {/if}
{/snippet}

{#snippet defaultSubmitComponent(username, password, active, enabled)}
  <button aria-keyshortcuts="Enter" type="submit" disabled={!enabled}>
    Login
    {#if active}
      <div class="spinner"></div>
    {/if}
  </button>
{/snippet}

<form {onsubmit}>
  {@render messageComponent(message)}
  <fieldset>
    <legend>Credentials</legend>
    <label>
      Username
      <input
        aria-label="username"
        aria-required="true"
        minlength="1"
        maxlength="75"
        size="32"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="username"
        id="username"
        type="text"
        placeholder="Username"
        required
        disabled={active}
        bind:value={username}
      />
    </label>
    <label>
      Password
      <input
        aria-label="password"
        aria-required="true"
        minlength="4"
        maxlength="50"
        size="32"
        autocorrect="off"
        autocapitalize="off"
        autocomplete="current-password"
        id="password"
        type="password"
        placeholder="Password"
        required
        disabled={active}
        bind:value={password}
      />
    </label>
  </fieldset>

  {@render submitComponent(username, password, active, enabled)}
  {@render footerComponent(username, password, active)}
</form>
