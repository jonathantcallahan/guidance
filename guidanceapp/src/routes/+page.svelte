<script>
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