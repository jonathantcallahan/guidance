<script lang='ts'>

    let command = ''
    let readonly = false
    function handleSubmission(event: KeyboardEvent) {
        if ( event.key != 'Enter' ) return;
        readonly = true
        console.log(command)
    }
</script>

<style>
input, input:active, input:focus {
  border: none;
  outline-width: 0;
  display: inline;
  font-family: inherit;
  font-size: inherit;
  padding: none;
  field-sizing: content;
}

.cursor {
    background-color: black;
    display: inline-block;
    width: 10px;
    height: 20px;
    animation: blink 1s infinite;
}

@keyframes blink {
  80%, 20% {
    opacity: 1;
  }
  100%, 0% {
    opacity: 0;
  }
}

</style>

<div class='block-container'>
    <span class='line-start'>you@spaceshipearth:</span><span>~$ alanbotts<input on:keyup={handleSubmission} bind:value={command} readonly={readonly || null} autofocus></span><div class='cursor'></div>
</div>