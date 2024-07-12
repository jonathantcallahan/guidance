<script>
    let question = '';
    let processedResponse = ''

    async function getAnswer() {
        const response = await fetch('/text-generation', {
			method: 'POST',
			body: JSON.stringify({ question }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

        const responseData = await response.json();
        processedResponse = responseData[0].generated_text.split('### Response:')[1]
        console.log(processedResponse);



    };
</script>

<h1>Welcome to SvelteKit</h1>
<input bind:value={question}/>
<button on:click={getAnswer}>get answer</button>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> tsssso read </p>
 
<p>{processedResponse}</p>