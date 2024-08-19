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
        'Layering synaptic signals' // shows response to user
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
        toSpeak.pitch = .001
        toSpeak.rate = 1.2
        synth.speak(toSpeak)
    }

    //iterateLoading()

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

				
    // async function nearTextQuery(question) {
        
    //     const client = await weaviate.connectToWeaviateCloud(
    //         import.meta.env.CLUSTER_URL || 'null',
    //         {
    //             authCredentials: new weaviate.ApiKey(import.meta.env.WEAVIATE_API_KEY || 'null'),
    //             headers: {
    //             'X-OpenAI-Api-Key': import.meta.env.OPENAI_AI_KEY || 'null',
    //             }
    //         } 
    //     )

    //     const questions = client.collections.get('Question');
        
    //     const result = await questions.query.nearText( question, {
    //         limit:1,
    //         returnMetadata: ['distance']
    //     });
        
    //     return result;
    // }


    // async function llmQuery(request) {
	
    //     //const requestText = await request.json()
    //     const requestText = request
    
    //     let startTime = Date.now()

    //     const vectorResult = await nearTextQuery(requestText.question);
    //     const vectorResultClean = vectorResult.objects[0].properties.answer;
    //     const distance = vectorResult.objects[0].metadata?.distance || 1;

    //     let inputRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Using the provided materials, return a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. As always, do not diverge from your standard speech patterns and do not over-embellish. Please answer the following question using the content from the reference text that follows it. You may change the content so that it more directly addresses the question being posed in a semantically correct manner. Do not repeat the question, simply answer the question using the concepts in the refernce text. \n### Input:\n${ requestText.question } <start of reference text> ${ vectorResultClean } <end of the reference text> \n### Response:\n`;
    //     let inputsNoRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using your standard speech patterns but do not over-embellish. DO NOT include the original question in the response. The response MUST NOT INCLUDE the question that is being asked. \n### Input:\n${ requestText.question }\n### Response:\n`

    //     const requestBody = { 
    //         inputs: distance > .2 ? inputsNoRAG : inputRAG,
    //         parameters: {}
    //     }

    //     try {
            
    //         const inference = new HfInference(import.meta.env.HUGGING_FACE_API_KEY)
    //         const llama = inference.endpoint('https://jq3a4fn9siusw6ee.us-east-1.aws.endpoints.huggingface.cloud')
    //         const results = await llama.textGeneration(requestBody)

    //         let processedText = results?.generated_text?.split('### Response:')[1]
    //         console.log(results)
    //         console.log('processed text /n' + processedText)
            
    //         return json({
    //             contents: processedText,
    //             distance: distance,
    //             book: vectorResult.objects[0].properties.book,
    //             executionTime: Date.now() - startTime
    //         })

    //     } catch (err) {
    //         console.log(err)
    //         return json({ contents: 'Error on server'})
    //     }
	
    // }

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

        // let response = await llmQuery(body)

        console.log(response)

        const responseData = await response.json()
        return responseData
    };

    let result: string[] = []
    async function streamingTest() {
        console.log('streaming test running')
        const response = await fetch('/text-generation')
        const reader = response.body?.pipeThrough( new TextDecoderStream()).getReader()
        while (true) {
            const { value, done } = await reader?.read()
            if (done) break
            result.push(value)
            result = result
        }

        
    }

    streamingTest()

    function commandLogic() {
        if (!pD.com.alan) {
            processedResponse = 'Command not recognized. Enter --help for a list of accepted commands.'
        } else if (!pD.opt.library && pD.com.ask && pD.text) {
            
            initQuery = true
            getAnswer(true).then(data => {
                currentLoadingStage = loadingStages.length
                bookName = data.book
                usedEntry = data.distance < .2
                vectorDistance = data.distance
                processedResponse = data.contents
                executionTime = data.executionTime
            })
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
    {#each result as str} {str}{/each}
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