import { json } from '@sveltejs/kit'
import weaviate from 'weaviate-client'
import { HfInference } from '@huggingface/inference'
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_AI_KEY,
});


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


export async function GET({ url }) {

	const encoder = new TextEncoder()
	const readable = new ReadableStream({
		async start(controller) {

				controller.enqueue(encoder.encode('{ "type": "stage", "value": 0}'))

				let startTime = Date.now()

				let searchText = url.searchParams.get('question') || ''

				let vectorResultClean = ''
				let inputNoRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. Please answer the following question using your standard speech patterns but do not over-embellish. DO NOT include the original question in the response. The response MUST NOT INCLUDE the question that is being asked. \n### Input:\n${ searchText }\n### Response:\n`
				let inputRAG = `Below is an instruction that describes a task, paired with an input that provides further context. Using the provided materials, return a response that appropriately completes the request.\n### Instruction: \nYou are English author and intellectual Alan Watts. As always, do not diverge from your standard speech patterns and do not over-embellish. Please answer the following question using the content from the reference text that follows it. You may change the content so that it more directly addresses the question being posed in a semantically correct manner. Do not repeat the question, simply answer the question using the concepts in the refernce text. \n### Input:\n${ searchText } <start of reference text> ${ vectorResultClean } <end of the reference text> \n### Response:\n`
				let distance = 1
				let book = ''

				try {
					const vectorResult = await nearTextQuery(searchText);
					console.log(vectorResult)
					vectorResultClean = vectorResult.objects[0]?.properties?.answer?.toString() || ''
					book = vectorResult.objects[0]?.properties?.book?.toString() || ''
					distance = vectorResult.objects[0].metadata?.distance || 1
				} catch (err) {
					controller.enqueue(encoder.encode('{"type" : "err", "content" : "Error with vector search" }'))
					controller.close()
				}

				controller.enqueue(encoder.encode('{"type": "stage", "value": 1}'))

				const requestBody = { 
					inputs: distance > .2 ? inputNoRAG : inputRAG,
					parameters: {}
				}

				try {
					
					// const inference = new HfInference(process.env.HUGGING_FACE_API_KEY)
					// const llama = inference.endpoint('https://jq3a4fn9siusw6ee.us-east-1.aws.endpoints.huggingface.cloud')
					
					// const results = await llama.textGeneration(requestBody)
					
					// console.log(results)

					// let processedText = results?.generated_text?.split('### Response:')[1]
					
					// console.log('processed text /n' + processedText)

					// const apiResults = {
					// 		contents: processedText,
					// 		distance: distance,
					// 		book: book,
					// 		executionTime: Date.now() - startTime
					// }

					async function main() {
						console.log('main running')
						const assistant = await openai.beta.assistants.retrieve("asst_eA8wZ6dtHQdt4Svv6Dupp0ZV");
						const thread = await openai.beta.threads.create();
						const message = await openai.beta.threads.messages.create( thread.id, { role: "user", content: searchText });
						const run = openai.beta.threads.runs.stream(thread.id, {
							assistant_id: assistant.id
						  })
							.on('textCreated', (text) => process.stdout.write('\nassistant > '))
							.on('textDelta', (textDelta, snapshot) => { controller.enqueue(encoder.encode(`{type: "response stream", content: ${textDelta.value}}`)) })
					}

					main();

					

					let apiResults = { test: "test" } 

					//controller.enqueue(encoder.encode(`{"type": "stage", "value": 3, "content": ${JSON.stringify(apiResults)}}`))

				} catch (err) {
					controller.enqueue(encoder.encode('{ "type" : "err", "content" : "Error with Huggingface" }'))
					controller.close()
				}
				controller.close()
		}
	})

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	})
}