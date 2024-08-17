<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import LoadingOutput from "./loading-output.svelte";
    import Welcome from "./welcome.svelte";
    import TalkingHead from "./talking-head.svelte";

    export let id;
    export let prompt;

    let initQuery = false
    let question = ''
    let processedResponse = ''
    let currentLoadingStage = 0
    const loadingStages = [
        'Initiating query',
        'Mapping substructures',
        'Establishing gateway',
        'Connection secured',
        'Projecting into quantum geometric space',
        'Layering synaptic signals',
        'Returning query result'
    ]
    const synth = window.speechSynthesis
    const voices = synth.getVoices()
    let audioActive = true;
    
    const iterateLoading = () => {
        if (currentLoadingStage > loadingStages.length - 1) return
        currentLoadingStage += 1
        setTimeout(iterateLoading, Math.random() * 1500 + 500)
    }

    $: processedResponse && speakResponse()
    const speakResponse = () => {
        if (!audioActive) return
        const toSpeak = new SpeechSynthesisUtterance(processedResponse)
        toSpeak.voice = voices[6]
        synth.speak(toSpeak)
    }

    iterateLoading()

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
        } else if (!pD.opt.library && pD.com.ask && pD.text) {
            initQuery = true
            getAnswer(true).then(data => {
                console.log('answer retrieved')
                currentLoadingStage = loadingStages.length
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
    {#if !pD.opt.library && pD.com.ask && pD.text}
        <br>
        > {pD.text}<br>
        >>{#if processedResponse}{@html processedResponse}{/if}
        <br>
        <TalkingHead /><br>
    {/if}
    {#each loadingStages as stage, i}
        {#if i <= currentLoadingStage && initQuery}
            <LoadingOutput loadingText={stage} queryLoading={i == currentLoadingStage}/>
        {/if}
    {/each}
    {#if pD.com.welcome} 
        <Welcome />
    {/if}
    <br>
</div>