type NewTransactionResponse = {
  accessUrl: string;
  id: string;
};

type CompletionData = {
  bankIdIssueDate: string;
  cert: {
    notAfter: string;
    notBefore: string;
  };
  device: {
    ipAddress: string;
  };
  ocspResponse: string;
  signature: string;
  stepUp: null | string;
  user: {
    givenName: string;
    name: string;
    personalNumber: string;
    surname: string;
  };
}

type TransactionResponse = {
  id: string;
  method: string;
  provider: string;
  providerInfo: {
    seBankID: {
      autoStartToken: string;
      completionData: CompletionData | null;
      processStatus: null | string;
      processStatusInfo: null | string;
      qrData: string;
    };
  };
  providerParameters: {
    auth: {
      seBankID: {
        callInitiator: null | string;
        personalNumber: null | string;
        requireAutoStartToken: boolean;
        userNonVisibleData: null | string;
        userVisibleData: null | string;
        userVisibleDataFormat: null | string;
      };
    };
  };
  redirectUrl: string;
  status:  'new'|'started'|'complete'|'failed';
};

type TransactionResponseDTO = {
  id: string;
  bankId: {
    autoStartToken: string;
    completionData: CompletionData | null;
    processStatus: null | string;
    processStatusInfo: null | string;
    qrData: string;
  }|null;
  status: 'new'|'started'|'complete'|'failed';
}