import { readBillboard } from "$lib/server/billboard";

export async function load() {
    try {
        return { billboard: await readBillboard() };
    } catch {
        return { billboard: null };
    }
}
