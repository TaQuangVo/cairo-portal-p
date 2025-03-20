import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions = {
    strategy: "database",
    jwt: {
      maxAge: 60 * 60 * 24 * 30,
    },
    callbacks: {
      async jwt({ token, user }:{token: JWT, user: any}) {
        if (user) {
          token.role = user.role;
        }
        return token;
      },
    },
    providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            ssn: { label: "Personal number", type: "text", placeholder: "Personal number" },
            transactionId: { label: "Transaction Id", type: "text", placeholder: "Transaction Id" },
          },
          async authorize(credentials, req) {
            const superUser = { id: "1", name: "Peakam", email: "peak@peakam.se", role:'admin!'}

            if (credentials?.transactionId === '12345') {
              return superUser
            }
            
            return null;
          }
        })
      ]
}

const authHandler = NextAuth(authOptions)

export default authHandler

export const { auth, handlers, signIn, signOut } = authHandler