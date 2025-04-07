import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"

// 👇 Verify that this messages comes from QStash
export const POST = verifySignatureAppRouter(async (req: Request) => {
  console.log('hello from qstash')
  const body = await req.json()
  const { Id } = body as { Id: string }
  console.log('Queue handler, body Id:', Id)
  // Image processing logic, i.e. using sharp

  return new Response(`Image with id "${Id}" processed successfully.`)
})