<script lang='ts'>
    import CommandBlock from "./command-block.svelte";
    import { onMount } from 'svelte';
    
    let ref: HTMLElement;
    
    onMount(() => {

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
    });     

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
</script>

<input bind:value={question}/>
<button on:click={getAnswer}>get answer</button>
<button on:click={getVectorSearch}>Search text for related snippet</button>
 
<p>{processedResponse}</p>


<CommandBlock bind:ref/>
