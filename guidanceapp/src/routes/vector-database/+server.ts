// @ts-ignore
//import { WEAVIATE_API_KEY } from '$env/static/private';
//import { CLUSTER_URL } from '$env/static/private';
//import { OPENAI_AI_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import weaviate from 'weaviate-client';
	
const client = await weaviate.connectToWeaviateCloud(
	process.env.CLUSTER_URL,
	{
		authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
		headers: {
		'X-OpenAI-Api-Key': process.env.OPENAI_AI_KEY,
		}
	} 
)

export async function POST( {request} ) {
	const requestText = await request.json()

	console.log(requestText)
	async function nearTextQuery() {  
		const questions = client.collections.get('Question');
	  
		const result = await questions.query.nearText( requestText.question, {
		  limit:1,
		  returnMetadata: ['distance']
		});
	  
		return result;
	  }

	const results = await nearTextQuery();
	console.log(JSON.stringify(results.objects, null, 2));
	const textResults = JSON.stringify(results.objects)
	return(json(textResults));  	
}