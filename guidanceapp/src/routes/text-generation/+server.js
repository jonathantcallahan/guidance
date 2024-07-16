//import { HUGGINGFACE_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

// @ts-ignore
export async function POST( {request} ) {
	
	const requestText = await request.json()
	console.log(requestText)
	
	const requestBody = { 
		inputs: `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using your standard speech patterns but do not over-embellish.\n### Input:\n${ requestText.question }\n### Response:\n`,
		parameters: {}
	}
	try {
		const response = await fetch(
			"https://jq3a4fn9siusw6ee.us-east-1.aws.endpoints.huggingface.cloud",
			{
				headers: { 
					"Accept" : "application/json",
					"Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
					"Content-Type": "application/json" 
				},
				method: "POST",
				body: JSON.stringify(requestBody),
			}
		);

		const result = await response.json()
		console.log(result)
		const processedResult = result[0].generated_text.split('### Response:')[1]
		return json({ contents: processedResult });

	} catch (err) {
		return json({ contents: 'Endpoint initializing... Try again in 15 minutes'})
	}
	
}