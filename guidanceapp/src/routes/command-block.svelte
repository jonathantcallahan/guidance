<script lang='ts'>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  export let ref: HTMLElement;
  export let id;

  const dispatch = createEventDispatcher();

  onMount(() => {
    dispatch('mount', {});
  })

  let command = ''
  let readonly = false;
  let cursorLeftPosition = "0px";
  let cursorTopPosition = "0px";
  let active = false;

  function handleFocus () {
    cursorPlacement();
    active = true;
  }

  function handleBlur () {
    cursorPlacement();
    active = false;
  }

  function preventNewline(event: KeyboardEvent) {
    cursorPlacement();
    // if the key is not enter do not process
    if ( event.key != 'Enter' ) return
    event.preventDefault()
  }

  function handleSubmission(event: KeyboardEvent, submission?: Boolean) {
    // put cursor in the correct position
    cursorPlacement();
    // if the key is not enter do not process
    if ( event.key != 'Enter' ) return
    event.preventDefault()
    // make content uneditable
    readonly = true;
    dispatch('command', {
      textContent: ref.textContent
    });
  }

  function cursorPlacement() {
    let cursorPosition = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    cursorLeftPosition = cursorPosition?.left + "px";
    cursorTopPosition = cursorPosition?.top + "px";
  }
</script>

<style>

* {
  caret-color: transparent;
}

.command-input, .command-input:active, .command-input:focus {
  border: none;
  outline-width: 0;
  display: inline;
  font-family: inherit;
  font-size: inherit;
  padding: none;
  width: 300px;
}

.cursor {
    background-color: #A2EE64;
    display: inline-block;
    width: 10px;
    height: 20px;
    animation: blink 1s infinite;
    position: fixed;
}

@keyframes blink {
  50% {
    opacity: 1;
  }
  100%, 0% {
    opacity: 0;
  }
}

</style>

<div class='block-container'>
    <span class='line-start'>you@spaceshipearth:</span>
      <div aria-hidden='true' class='command-input'
        on:keyup={handleSubmission}
        on:keydown={preventNewline} 
        on:click={cursorPlacement}
        on:focus={handleFocus} 
        on:blur={handleBlur}
        contenteditable={!readonly || null}
        bind:this={ref}
        role='textbox'
        spellcheck='false'>
        ~$ alanbotts&nbsp; 
      </div>
    <div class='cursor' style="top: {cursorTopPosition}; left: {cursorLeftPosition}; display: {active && !readonly ? "inline-block" : "none"}"></div>
</div>