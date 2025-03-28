import NextAuth, { Session, User} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { getTransaction } from "./scrive";
import { getUserByPersonalNumber } from "@/services/userService";
import { convertPersonalNumber } from "@/utils/stringUtils";
import { JWT } from "next-auth/jwt";


export const authOptions = {
    strategy: "jwt",
    jwt: {
      maxAge: 60 * 60 * 24 * 30,
    },
    callbacks: {
      async jwt({ token, user }:{token: JWT, user: User}) {
        if (user) {
          token = {
            ...token,
            ...user
          }
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT}) {
        if (session.user) {
          session.user={
            ...token,
          }
        }
        return session;
      },
    },



    
    providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            transactionId: { label: "Transaction Id", type: "text", placeholder: "Transaction Id" },
          },
          async authorize(credentials, req) {
            if(!credentials?.transactionId){
              return null;
            }

            //get transaction from bankId
            const st = await getTransaction(credentials.transactionId);
            if(st.status != 'complete'){
              return null;
            }

            let userSSN = st.bankId?.completionData?.user?.personalNumber;
            if(!userSSN){
              return null;
            }

            try{
              userSSN = convertPersonalNumber(userSSN)
            }catch(e){
              return null;
            }

            //Check if user is registered in our system
            const user = await getUserByPersonalNumber(userSSN)

            if(user && !user.isActive){
              return null;
            }

            if(user){
              return {
                id: user._id,
                personalNumber: user.personalNumber,
                role: user.role,
                isActive: user.isActive,

                email: user.email,
                givenName: user.givenName,
                surname: user.surname,
                phoneNumber: user.phoneNumber,

                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              };
            }
            
            return null;
          }
        })
      ]
}

const authHandler = NextAuth(authOptions)

export default authHandler

export const { auth, handlers, signIn, signOut } = authHandler