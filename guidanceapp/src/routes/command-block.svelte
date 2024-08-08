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
  width: auto;
}
</style>

<div class='block-container'>
    <span class='line-start'>you@spaceshipearth:</span><span>~$ alanbotts<input on:keyup={handleSubmission} bind:value={command} readonly={readonly || null}></span>
</div>