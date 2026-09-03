import { json } from "@sveltejs/kit";

import { readBillboard } from "$lib/server/billboard";

export async function GET() {
    return json(await readBillboard(), {
        headers: {
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=10"
        }
    });
}
