<script lang='ts'>
    import CommandBlock from "./command-block.svelte";
    import { onMount } from 'svelte';
    import CommandOutput from "./command-output.svelte";
    import { writable } from "svelte/store";
    
    interface Component {
        id: Number,
        type: 'command' | 'output'
    }

    let components = writable<Component[]>([]);

    function addCommand(prefill) {
        components.update(n => [
            ...n,
            { id: n.length + 1, type: 'command', prefill: prefill}
        ]);
    }

    function addResponse(prompt) {
        components.update(n => [
            ...n,
            { id: n.length + 1, type: 'output', prompt: prompt}
        ]);
    }

    let ref: HTMLElement;

    onMount(() => {
        addCommand('');
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

    async function getVectorSearch() {
        console.log(question)
        let response = await fetch('/vector-database', {
            method: 'POST',
            body: JSON.stringify({ question }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        processedResponse = await response.json()
    }

    async function getAnswer() {
        let response = await fetch('/text-generation', {
			method: 'POST',
			body: JSON.stringify({ question }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

        const responseData = await response.json();
        processedResponse = responseData.contents 
    };

    // function handleCommand(textContent) {
    //     console.log(textContent.detail.textContent);
    //     const newOutput = new CommandOutput({
    //         target: document.querySelector('#command-line')
    //     })
    // }
</script>

<input bind:value={question}/>
<button on:click={getAnswer}>get answer</button>
<button on:click={getVectorSearch}>Search text for related snippet</button>
 
<p>{processedResponse}</p>

<div id='command-line'>
    {#each $components as component (component.id )}
        {#if component.type == 'command'}
            <CommandBlock bind:ref on:mount={handleFocus} on:command={addResponse} id={component.id} />
        {:else}
            <CommandOutput on:mount={addCommand} id={component.id} />
        {/if}
    {/each}
    <!-- <CommandBlock bind:ref on:command={handleCommand}/> -->
</div>
