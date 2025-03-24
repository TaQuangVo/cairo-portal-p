
async function makeRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        const scriveBearerToken = process.env.SCRIVE_BEARER_TOKEN
        const baseUrl = process.env.SCRIVE_URL

        const request = fetch(baseUrl + url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + scriveBearerToken,
                ...(options?.headers || {}),
            },
        });
        const response = await request

        if (!response.ok) {
            const json = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json() as Promise<T>;
    } catch (error) {
        throw error;
    }
}

function toTransactionResponseDTO(response: TransactionResponse): TransactionResponseDTO {
    const a = {
        id: response.id,
        bankId: response.providerInfo?.seBankID,
        status:response.status
    }
    return a
}

export async function newTransaction() {
    const data = {
        "method": "auth",
        "provider": "seBankID",
        "redirectUrl": "https://google.com",
        "providerParameters": {
            "auth": {
                "seBankID": {
                    "requireAutoStartToken": true
                }
            }
        }
    }
    return makeRequest<NewTransactionResponse>(`/transaction/new`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
}

export async function startTransaction(transactionId:string) {
    const data = {}
    const response = await makeRequest<TransactionResponse>(`/transaction/${transactionId}/start`, 
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    return toTransactionResponseDTO(response)

}

export async function getTransaction(transactionId:string) {
    const response = await  makeRequest<TransactionResponse>(`/transaction/${transactionId}`)
    return toTransactionResponseDTO(response)
}

