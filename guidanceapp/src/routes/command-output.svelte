<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import LoadingOutput from "./loading-output.svelte";
    import Welcome from "./welcome.svelte";
    import TalkingHead from "./talking-head.svelte";

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
    let processedResponse: String
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
    
    const iterateLoading = () => {
        if (currentLoadingStage > loadingStages.length - 1) return
        currentLoadingStage += 1
        setTimeout(iterateLoading, Math.random() * 1500 + 500)
    }

    $: processedResponse && speakResponse()
    const speakResponse = () => {
        if (!audioSettings) return
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

    // async function getVectorSearch() {
    //     console.log(question)
    //     let response = await fetch('/vector-database', {
    //         method: 'POST',
    //         body: JSON.stringify({ question }),
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     processedResponse = await response.json()
    //     console.log(processedResponse)
    // }

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
                bookName = data.book
                vectorDistance = data.distance
                processedResponse = data.contents
                console.log(processedResponse)
            })
        } else if(pD.com.audio) {
            console.log('current audio is ' + audioSettings)
            dispatch('audio', {})
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
.stats-row {
    display: flex;
    flex-direction: row;
    width: 300px;
}

.stats-row > div {
    flex: 1;
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
                    <div>{executionTime}</div>
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
        <div>Audio output turned {audioSettings ? 'on' : 'off'}</div>
    {/if}
    <br>
</div>