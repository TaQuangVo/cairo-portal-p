import NextAuth, { getServerSession, Session, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { getTransaction } from "./scrive";
import { getUserByPersonalNumber } from "@/services/userService";
import { convertPersonalNumber } from "@/utils/stringUtils";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_LIFESPAN = 15 * 60 * 1000; // 15 minutes
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;


export const authOptions = {
  strategy: "jwt",
  jwt: {
    maxAge: 60 * 60 * 24,
  },
  session: {
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: User }) {
      if (user) {
        token = {
          ...user,
        }
      }

      // Every request after login
      const isExpired = Date.now() > token.accessTokenExpiry;
      if (isExpired) {
        return {
          ...token,
          error: "SessionExpired",
        } as JWT;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user = {
          id: token.id,
          personalNumber: token.personalNumber,
          role: token.role,
          isActive: token.isActive,

          email: token.email,
          givenName: token.givenName,
          surname: token.surname,
          phoneNumber: token.phoneNumber,

          createdAt: token.createdAt,
          updatedAt: token.updatedAt,

          accessTokenExpiry: token.accessTokenExpiry,
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
        const session = await getServerSession(authOptions);

        let userSSN: string | undefined

        if (!session || !session.user || !session.user.personalNumber) {
          if (!credentials?.transactionId) {
            return null;
          }

          //get transaction from bankId
          const st = await getTransaction(credentials.transactionId);
          if (st.status != 'complete') {
            return null;
          }

          userSSN = st.bankId?.completionData?.user?.personalNumber;
          if (!userSSN) {
            return null;
          }

          try {
            userSSN = convertPersonalNumber(userSSN)
          } catch (e) {
            return null;
          }
        } else {
          userSSN = session.user.personalNumber;
        }

        //Check if user is registered in our system
        const user = await getUserByPersonalNumber(userSSN)

        if (!user || !user.isActive) {
          return null;
        }

        // ✅ Generate tokens directly here
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });

        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET!, {
          expiresIn: "1d",
        });

        const accessTokenExpiry = Date.now() + 60 * 60 * 1000;

        if (user) {
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

            accessToken,
            refreshToken,
            accessTokenExpiry,
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