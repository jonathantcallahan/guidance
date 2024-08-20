<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import LoadingOutput from "./loading-output.svelte";
    import Welcome from "./welcome.svelte";
    import TalkingHead from "./talking-head.svelte";
    import { json } from '@sveltejs/kit'

    export let id;
    export let prompt;
    export let audioSettings: Boolean;


    
    // meta info fields about query
    let executionTime = 0
    let vectorDistance = 0
    let usedEntry = false
    let bookName = ''

    let initQuery = false
    let question = ''
    let processedResponse: string
    let currentLoadingStage = 0
    const loadingStages = [
        'Establishing gateway', // processesing text 
        'Mapping substructures', // sending request to server, server queries vector database
        'Projecting quantum geometrics', // gets response from vector database, server runs inference through huggingface
        //'Layering synaptic signals' // shows response to user
    ]
    
    const iterateLoading = () => {
        if (currentLoadingStage > loadingStages.length - 1) return
        currentLoadingStage += 1
        setTimeout(iterateLoading, Math.random() * 1500 + 500)
    }

    $: processedResponse && speakResponse()
    const speakResponse = () => {
        if (!audioSettings) return
        const synth = window.speechSynthesis
        const voices = synth.getVoices()
        const toSpeak = new SpeechSynthesisUtterance(processedResponse)
        toSpeak.voice = voices[6]
        toSpeak.pitch = 1
        toSpeak.rate = 1
        synth.speak(toSpeak)
    }


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

    async function getAnswer(vectorSearch?: Boolean, generation?: Boolean, generationOnly?: Boolean ) {

        let body = JSON.stringify({ 
                question: pD.text,
                vectorSearch: vectorSearch,
                generation: generation,
                generationOnly: generationOnly 
        })
        
        let response = await fetch('/text-generation', {
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/json'
			}
		});

        console.log(response)

        const responseData = await response.json()
        return responseData
    };

    let result: string[] = []
    
    async function getResponse() {

        const queryObj: object = {
            question: pD.text,
            vectorSearch: pD.opt.library,
            generation: pD.opt.generate 
        }

        const baseUrl = ('/text-generation/?')
        const params = new URLSearchParams(queryObj).toString()

        const response = await fetch(baseUrl + params)
        const reader = response.body.pipeThrough( new TextDecoderStream()).getReader()
        while (true) {
            const { value, done } = await reader.read()
            console.log(value)
            let parsedResponse = JSON.parse(value)
            if (parsedResponse.value) {
                currentLoadingStage = parsedResponse.value
            }
            if (parsedResponse.content) {
                 
                bookName = parsedResponse.content.book
                usedEntry = parsedResponse.content.distance < .2
                vectorDistance = parsedResponse.content.distance
                processedResponse = parsedResponse.content.contents
                executionTime = parsedResponse.content.executionTime
            }
            if (done) break
        }
    }

    function commandLogic() {
        if (!pD.com.alan) {
            processedResponse = 'Command not recognized. Enter --help for a list of accepted commands.'
        } else if (!pD.opt.library && pD.com.ask && pD.text) {
            
            initQuery = true
            getResponse()

        } else if(pD.com.audio) {
            dispatch('audio', {})
        }


        dispatch('output', {})
    }
    
    const dispatch = createEventDispatcher()
    onMount(() => {
        window.speechSynthesis.cancel()
        commandLogic()
    })
</script>

<style>
.stats-row {
    display: flex;
    flex-direction: row;
    width: 400px;
}

.stats-row > div {
    flex: 1;
}

.stats-row > div:nth-of-type(1) {
    flex: 0 0 30% !important
}
    
</style>

<div id={id}>
    {#if !pD.opt.library && pD.com.ask && pD.text && currentLoadingStage >= loadingStages.length}
        <br>
        {#if vectorDistance > .2}
            <div>
                WARNING: Unusually large vector distance. Results may be unpredictable.<br> 
                Consider tailoring your question to be more suited for the target consciousness.
            </div>
            <br>
        {/if}
        <div>> {pD.text}</div>
        <div>>>{#if processedResponse}{@html processedResponse}{/if}</div>
        <TalkingHead /><br>
        {#if !pD.opt.plain && processedResponse}
            <div class='meta-stats-container'>
                <div class='stats-row'>
                    <div>Execution time: </div>
                    <div>{executionTime} MS</div>
                </div>
                {#if !pD.opt.generate}
                <div class='stats-row'>
                    <div>Vector distance: </div>
                    <div>{vectorDistance}</div>
                </div>
                <div class='stats-row'>
                    <div>Entry used: </div>
                    <div>{usedEntry}</div>
                </div>
                <div class='stats-row'>
                    <div>Reference text: </div>
                    <div>{bookName}</div>
                </div>
            {/if}
        </div>
        <br>
        {/if}
    {/if}
    {#if currentLoadingStage < loadingStages.length}
        <br>
        {#each loadingStages as stage, i}
            {#if i <= currentLoadingStage && initQuery}
                <LoadingOutput loadingText={stage} queryLoading={i == currentLoadingStage}/>
            {/if}
        {/each}
    {/if}
    {#if pD.com.welcome} 
        <Welcome />
    {/if}
    {#if pD.com.audio} 
        <br>
        <div>Audio output turned {audioSettings ? 'on' : 'off'}</div>
    {/if}
    <br>
</div>