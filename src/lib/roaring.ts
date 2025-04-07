import { RoaringAccessToken } from "./roaring.type";

let cachedToken: RoaringAccessToken | null = null;

export async function getAccessToken(): Promise<RoaringAccessToken> {
    const now = Date.now(); // Now clearly scoped within the function

    if (!cachedToken || cachedToken.expires_at < now) {
        console.log('Fetching new Roaring access token...');
        const res = await fetch(`${process.env.ROARING_API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${process.env.ROARING_CLIENT_ID}:${process.env.ROARING_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials'
            })
        });

        if (!res.ok) {
            console.error('Failed to fetch access token:', res.statusText);
            throw new Error('Failed to fetch access token');
        }

        const responseBody = await res.json();
        cachedToken = {
            access_token: responseBody.access_token,
            expires_at: now + (responseBody.expires_in * 1000) - 30000,
            token_type: responseBody.token_type
        };
    }

    return cachedToken;
}


export async function swedishPopulationRegisterSearch(personalNumber: string){
    const token = await getAccessToken();
    const res = await fetch(`${process.env.ROARING_API_BASE_URL}/person/2.0/current/${personalNumber}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        console.error('Failed to fetch population register search:', res.statusText);
        throw new Error('Failed to fetch population register search');
    }

    const data = await res.json();
    console.log('Population register search data: ', data);
    return data;
}