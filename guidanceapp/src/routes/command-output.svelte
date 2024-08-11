<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let id;
    export let prompt;

    let initQuery = false
    let initQueryLoading = false
    let question = ''
    let processedResponse = ''
    const loadingChars = ['⠁','⠂','⠄','⡀','⢀','⠠','⠐','⠈']
    let activeCharOffset = 0
    setInterval(() => activeCharOffset = activeCharOffset > 6 ? 0 : activeCharOffset + 1, 75)

    let pD = {
        com: {
            ask: / ask( |$)/.test(prompt.detail.textContent),
            welcome: / welcome( |$)/.test(prompt.detail.textContent),
            about: / about( |$)/.test(prompt.detail.textContent),
            audio: / audio( |$)/.test(prompt.detail.textContent),
            alan: /( |^)alanbotts /.test(prompt.detail.textContent)
        },
        opt: {
            help: / -h( |$)| --help( |$)/.test(prompt.detail.textContent),
            version: / -v( |$)| --version( |$)/.test(prompt.detail.textContent),
            plain: / -p( |$)| --plain( |$)/.test(prompt.detail.textContent),
            generate: / -g( |$)| --generate( |$)/.test(prompt.detail.textContent),
            library: / -l( |$)| --library( |$)/.test(prompt.detail.textContent)
        },
        text: prompt.detail.textContent.match(/(?<=").*(?=")/)
    };

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
			body: JSON.stringify({ question: pD.text }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

        const responseData = await response.json();
        processedResponse = responseData.contents 
    };

    function commandLogic() {
        if (!pD.com.alan) {
            processedResponse = 'Command not recognized. Try starting your submission with the string alanbotts'
        } else {
            initQuery = true
            initQueryLoading = true
            getAnswer()
            $: initQueryLoading = processedResponse ? false : true 
        }


        dispatch('output', {})
    }
    
    const dispatch = createEventDispatcher();
    onMount(() => {
        //let rawPrompt = prompt.detail.textContent
        console.log(JSON.stringify(pD))
        commandLogic()
    })
</script>

<style>
    .markup-command {
        color: red
    }
</style>

<div id={id}>
    {@html processedResponse}<br><br>
    {#if initQuery}
    <div>
        <span>{initQueryLoading ? loadingChars[0 + activeCharOffset > 6 ? (0 + activeCharOffset - 7) : 0 + activeCharOffset] : 3}</span>
        <span>{initQueryLoading ? loadingChars[1 + activeCharOffset > 6 ? (1 + activeCharOffset - 7) : 1 + activeCharOffset] : 3} </span>
        <span>{initQueryLoading ? loadingChars[2 + activeCharOffset > 6 ? (2 + activeCharOffset - 7) : 2 + activeCharOffset] : 3}</span>
        <span>Initiating query</span>
    </div>
    {/if}
</div>