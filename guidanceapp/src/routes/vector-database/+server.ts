// @ts-ignore
import { WEAVIATE_API_KEY } from '$env/static/private';
import { CLUSTER_URL } from '$env/static/private';
import { OPENAI_AI_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import weaviate from 'weaviate-client';
	
const client = await weaviate.connectToWeaviateCloud(
	CLUSTER_URL,
	{
		authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
		headers: {
		'X-OpenAI-Api-Key': OPENAI_AI_KEY,
		}
	} 
)

export async function POST( {request} ) {
	const requestText = await request.json()

	console.log(requestText)
	async function nearTextQuery() {  
		const questions = client.collections.get('Question');
	  
		const result = await questions.query.nearText( requestText.question, {
		  limit:2
		});
	  
		for (let object of result.objects) {
		  console.log(JSON.stringify(object.properties, null, 2));
		}
	  
		return result;
	  }

	const results = await nearTextQuery();
	const textResults = results.objects[0].properties.text
	return(json(textResults));  	
}