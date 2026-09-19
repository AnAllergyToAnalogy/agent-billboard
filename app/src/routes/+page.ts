import { PUBLIC_CACHE_URL } from '$env/static/public';


//@ts-ignore
import type { PageLoad } from './$types';



export const load: PageLoad = async ({ params }: any) => {

    const freshmaker = `?t=${Date.now()}`;
	
	const response = await fetch(PUBLIC_CACHE_URL+freshmaker);

	let cache;
	if (!response.ok){
		cache = null;
	}else{
		cache = await response.json();
	}


	return {
		cache
	};
};