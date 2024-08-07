//import { HUGGINGFACE_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import weaviate from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(
	process.env.CLUSTER_URL || 'null',
	{
		authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'null'),
		headers: {
		'X-OpenAI-Api-Key': process.env.OPENAI_AI_KEY || 'null',
		}
	} 
)

const questions = client.collections.get('Question');
				
async function nearTextQuery(question) {
	const result = await questions.query.nearText( question, {
		limit:1,
		returnMetadata: ['distance']
	});
	return result;
}
// @ts-ignore
export async function POST( {request} ) {
	
	const requestText = await request.json()
	console.log(requestText)

	const vectorResult = await nearTextQuery(requestText.question);
	const vectorResultClean = vectorResult.objects[0].properties.question;
	console.log(vectorResultClean);
	
	const requestBody = { 
		inputs: `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using the content from the text block that follows it. Transform the text only enought that it is an acceptable answer to the question. As always, do not diverge from your standard speech patterns and do not over-embellish.\n### Input:\n${ requestText.question } end of question, start of reference text: ${ vectorResultClean } \n### Response:\n`,
		//inputs: `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using your standard speech patterns but do not over-embellish.\n### Input:\n${ requestText.question }\n### Response:\n`,
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
		console.log(err)
		return json({ contents: 'Endpoint initializing... Try again in 15 minutes'})
	}
	
}