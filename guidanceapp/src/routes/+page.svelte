<script lang='ts'>
    import CommandBlock from "./command-block.svelte";
    import { onMount } from 'svelte';
    import CommandOutput from "./command-output.svelte";
    import { writable } from "svelte/store";
    import Phosphor from "./phosphor.svelte";
    
    interface Component {
        id: Number,
        type: 'command' | 'output',
        prompt?: CustomEvent
    }

    let components = writable<Component[]>([]);

    function addCommand(prefill?: CustomEvent) {
        components.update(n => [
            ...n,
            { id: n.length + 1, type: 'command', prefill: prefill}
        ]);
    }

    function addResponse(prompt: CustomEvent) {
        components.update(n => [
            ...n,
            { id: n.length + 1, type: 'output', prompt: prompt}
        ]);
    }

    let ref: HTMLElement;

    onMount(() => {
        addCommand();
    })

    function handleFocus() {

        ref.focus(); 
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(ref.childNodes[0], 13);
        range.collapse(true);

        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
            ref.click();
        }
    };     

    let question = '';
    let processedResponse = ''

</script>

<style>
:global(body) {
    margin: 0px
}

#command-line {
    background: #192712;
    color: #A2EE64;
    font-family: monospace;
    height: 100vh;
    text-shadow:
      0 0 7px #fff,
      0 0 10px #fff,
      0 0 21px #fff,
      0 0 42px #0fa,
      0 0 82px #0fa,
      0 0 92px #0fa,
      0 0 102px #0fa,
      0 0 151px #0fa;
}
    
</style>

<div id='command-line'>
    <Phosphor/>
    {#each $components as component (component.id )}
        {#if component.type == 'command'}
            <CommandBlock bind:ref on:mount={handleFocus} on:command={addResponse} id={component.id} />
        {:else}
            <CommandOutput prompt={component.prompt} on:output={addCommand} id={component.id} />
        {/if}
    {/each}
</div>
