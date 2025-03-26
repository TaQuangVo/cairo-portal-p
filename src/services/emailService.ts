import { NewPortfolioResponse } from '@/app/api/submittions/portfolios/helper';
import { transport } from '@/lib/mailer';
import Mail from 'nodemailer/lib/mailer';

export async function sendSubmittionFailureReportMail(submittionResult:NewPortfolioResponse, userId:string){
    const senderEmail = process.env.MY_EMAIL;
    if(!senderEmail){
        throw new Error('Sender email is not defined.')
    }

    const mailOptions: Mail.Options = {
        from: senderEmail,
        to: senderEmail,
        // cc: email, (uncomment this line if you want to send a copy to the sender)
        subject: `Submittion Failure Report`,
        text: `
Supmitted by: ${userId}

Attatchment Data:
${JSON.stringify(submittionResult, null, '\t')}
        `,
      };

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