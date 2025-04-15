import { getToken, JWT } from "next-auth/jwt"
import { NextRequest } from "next/server"

type TokenValidationResult =
  | {
      isLoggedIn: true;
      isAdmin: boolean;
      token: JWT;
    }
  | {
      isLoggedIn: false;
      isAdmin: false;
      token: null;
    };

export const tokenValidator = async (req: NextRequest):Promise<TokenValidationResult> => {
    const token = await getToken({ req })

    if (!token) {
        return { isLoggedIn: false, isAdmin: false, token: null }
    }

    if (token.accessTokenExpiry < Date.now()) {
        return { isLoggedIn: false, isAdmin: false, token: null }
    }

    if (token.role === "admin") {
        return { isLoggedIn: true, isAdmin: true, token }
    }

    return { isLoggedIn: true, isAdmin: false, token }
}