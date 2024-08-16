<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import LoadingOutput from "./loading-output.svelte";

    export let id;
    export let prompt;

    let initQuery = false
    let initQueryLoading = false
    let question = ''
    let processedResponse = ''
    

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
        console.log(processedResponse)
    }

    async function getAnswer(vectorSearch?: Boolean, generation?: Boolean, generationOnly?: Boolean ) {

        let response = await fetch('/text-generation', {
			method: 'POST',
			body: JSON.stringify({ 
                question: pD.text,
                vectorSearch: vectorSearch,
                generation: generation,
                generationOnly: generationOnly 
            }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

        const responseData = await response.json()
        return responseData
    };

    function commandLogic() {
        if (!pD.com.alan) {
            processedResponse = 'Command not recognized. Enter --help for a list of accepted commands.'
        } else if (!pD.opt.library && pD.com.ask) {
            initQuery = true
            initQueryLoading = true
            getAnswer(true).then(data => {
                console.log('answer retrieved')
                processedResponse = data.contents 
                console.log(processedResponse)
            })
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
    
</style>

<div id={id}>
    {@html processedResponse}<br><br>
    <LoadingOutput loadingText='Initiating query'/>
</div>