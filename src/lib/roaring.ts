import { convertPersonalNumber } from "@/utils/stringUtils";
import { RoaringAccessToken, RoaringCompanyOverviewRecords, RoaringCompanyOverviewResponse, RoaringPopulationRegisterRecord, RoaringPopulationRegisterResponse } from "./roaring.type";

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


export async function swedishPopulationRegisterSearch(personalNumber: string): Promise<RoaringPopulationRegisterRecord[] | null>{
    console.log('Make request to Roaring To get Population register for: ' + personalNumber)
    const token = await getAccessToken();
    const res = await fetch(`${process.env.ROARING_API_BASE_URL}/person/2.0/current/${personalNumber.replaceAll('-', '')}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        console.log('Population register request failed')
        throw new Error('Failed to fetch population register search');
    }

    const data = await res.json() as RoaringPopulationRegisterResponse;
    if(data.status.code === 1){
        return null
    }

    for(let record of data.records){
        try{
            record.personId = convertPersonalNumber(record.personId)
        }catch(e){}
    }

    return data.records;
}

export async function swedishCompanyOverviewSearch(orgNumber: string): Promise<RoaringCompanyOverviewRecords[] | null>{
    console.log('Make request to Roaring To get Company Overview for: ' + orgNumber)
    const token = await getAccessToken();
    orgNumber = orgNumber.replaceAll('-', '')
    orgNumber = orgNumber.length == 12 ? orgNumber.substring(2) : orgNumber

    const res = await fetch(`${process.env.ROARING_API_BASE_URL}/se/company/overview/2.0/${orgNumber}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        console.log('Company Overview request failed')
        throw new Error('Failed to fetch Company Overview search');
    }

    const data = await res.json() as RoaringCompanyOverviewResponse;
    if(data.status.code === 1){
        return null
    }

    for(let record of data.records){
        try{
            record.companyId = convertPersonalNumber(record.companyId)
        }catch(e){}
    }

    return data.records;
}