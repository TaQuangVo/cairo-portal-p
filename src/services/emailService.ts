import { NewPortfolioResponse } from '@/app/api/submittions/portfolios/helper';
import { DBUser } from '@/lib/db.type';
import { transport } from '@/lib/mailer';
import Mail from 'nodemailer/lib/mailer';

export async function sendSubmittionFailureReportMail(message: string, submittionResult:NewPortfolioResponse, userId:string, ccMe:string | null | undefined, user:DBUser){
    const senderEmail = process.env.MY_EMAIL;
    if(!senderEmail){
        throw new Error('Sender email is not defined.')
    }

    const mailOptions: Mail.Options = {
        from: senderEmail,
        to: senderEmail,
        subject: `Submittion Failure Report`,
        text: `
Submitter:
  Id: ${userId} 
  Name: ${user.givenName} ${user.surname}
  Personal number: ${user.personalNumber}
  Email: ${user.email}
  Phone: ${user.phoneNumber}

Message: 
  ${message}`,
        attachments: [
          {
            filename: 'submittionResult.json', // Name of the attachment
            content: JSON.stringify(submittionResult, null, '\t'), // Convert JSON object to string
            contentType: 'application/json' // MIME type for JSON files
          }
        ],
      };

    if(ccMe && user.email){
        mailOptions.cc = user.email;
    }

    const result = await transport.sendMail(mailOptions)
    if(!result.accepted.includes(senderEmail)){
        return false
    }
    return true
}

`
sendMail returns
{
  accepted: [ 'danxawe@gmail.com' ],
  rejected: [],
  ehlo: [
    'SIZE 35882577',
    '8BITMIME',
    'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
    'ENHANCEDSTATUSCODES',
    'PIPELINING',
    'CHUNKING',
    'SMTPUTF8'
  ],
  envelopeTime: 167,
  messageTime: 541,
  messageSize: 2756,
  response: '250 2.0.0 OK  1743001209 2adb3069b0e04-54ad651159dsm1869710e87.216 - gsmtp',
  envelope: { from: 'danxawe@gmail.com', to: [ 'danxawe@gmail.com' ] },
  messageId: '<be0673df-2dd1-8a87-7e3e-f27dfa5c3605@gmail.com>'
}
`