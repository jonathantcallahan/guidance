import { json } from '@sveltejs/kit'
import weaviate from 'weaviate-client'
import { HfInference } from '@huggingface/inference'

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


export async function POST( {request} ) {
	
	const requestText = await request.json()

	let startTime = Date.now()

	const vectorResult = await nearTextQuery(requestText.question);
	const vectorResultClean = vectorResult.objects[0].properties.answer;
	const distance = vectorResult.objects[0].metadata?.distance || 1;

	let inputRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Using the provided materials, return a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. As always, do not diverge from your standard speech patterns and do not over-embellish. Please answer the following question using the content from the reference text that follows it. You may change the content so that it more directly addresses the question being posed in a semantically correct manner. Do not repeat the question, simply answer the question using the concepts in the refernce text. \n### Input:\n${ requestText.question } <start of reference text> ${ vectorResultClean } <end of the reference text> \n### Response:\n`;
	let inputsNoRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using your standard speech patterns but do not over-embellish. DO NOT include the original question in the response. The response MUST NOT INCLUDE the question that is being asked. \n### Input:\n${ requestText.question }\n### Response:\n`

	const requestBody = { 
		inputs: distance > .2 ? inputsNoRAG : inputRAG,
		parameters: {}
	}
	try {
		
		const inference = new HfInference(process.env.HUGGING_FACE_API_KEY)
		const llama = inference.endpoint('https://jq3a4fn9siusw6ee.us-east-1.aws.endpoints.huggingface.cloud')
		const results = await llama.textGeneration(requestBody)

		let processedText = results?.generated_text?.split('### Response:')[1]
		console.log(results)
		console.log('processed text /n' + processedText)
		
		return json({
			contents: processedText,
			distance: distance,
			book: vectorResult.objects[0].properties.book,
			executionTime: Date.now() - startTime
		})

	} catch (err) {
		console.log(err)
		return json({ contents: 'Error on server'})
	}
	
}