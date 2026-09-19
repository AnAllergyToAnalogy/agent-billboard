import { PUBLIC_HISTORY_URL } from '$env/static/public';

//@ts-ignore
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ params }: any) => {

    const response = await fetch(PUBLIC_HISTORY_URL);

    let history;
    if (!response.ok){
        history = null;
    }else{
        history = await response.json();
    }

    return {
        history
    };
};