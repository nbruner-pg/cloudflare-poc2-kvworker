export interface Env {
	ghmc_kvpoc: KVNamespace;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		if(request.method === "GET"){
			const { searchParams } = new URL(request.url);
			const message = searchParams.get('message');
			const key = searchParams.get('key');
			if(message){
				return new Response(`Tell the world: ${message}`);
			}
			if(key){
				const start = Date.now();
				const value = await env.ghmc_kvpoc.get(key);
				const end = Date.now();
  				const diff = end - start;
				if(value == null){
					return new Response(`Value not found for key '${key}'`, { status: 404 });
				}
				const response = new Response(`Successfully got kv value for key '${key}':'${value}' in ${diff} ms.`);
				response.headers.append('Fetch-Time', diff.toString());
				return response;
			}
			return new Response("Hello World!");
		}

		if(request.method === "POST"){
			const body = await request.json<KVBody>();
			await env.ghmc_kvpoc.put(body.key, body.value);
			return new Response(`Successfully put kv pair key:${body.key} with value:${body.value}`);
		}
		
		return new Response("Verb not supported!");
	},
};

class KVBody {
	public key: string = "";
	public value: string = "";
}
