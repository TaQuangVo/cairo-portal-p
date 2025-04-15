import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_LIFESPAN = 60 * 60 * 1000; // 15 minutes
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    console.log('refreshAccessToken:' + token.refreshToken);
    try {
      // Verify refresh token
      const decodedAccessToken = jwt.verify(token.accessToken, JWT_SECRET) as jwt.JwtPayload;
      if (!decodedAccessToken || !decodedAccessToken.userId) {
        throw new Error("Invalid access token");
      }
      if (!decodedAccessToken.exp || Date.now() > decodedAccessToken.exp * 1000) {
        throw new Error("Access token expired");
      }
      if (decodedAccessToken.userId !== token.id) {
        throw new Error("Access token does not belong to this user");
      }
  
  
      // Verify refresh token
      const decodedRefreshToken = jwt.verify(token.refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
      if (!decodedRefreshToken || !decodedRefreshToken.userId) {
        throw new Error("Invalid refresh token");
      }
      if (!decodedRefreshToken.exp || Date.now() > decodedRefreshToken.exp * 1000) {
        throw new Error("Refresh token expired");
      }
      if (decodedRefreshToken.userId !== token.id) {
        throw new Error("Refresh token does not belong to this user");
      }
  
      const newAccessToken = jwt.sign(
        { userId: decodedRefreshToken.userId },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      const newRefreshToken = jwt.sign(
        { userId: decodedRefreshToken.userId },
        REFRESH_SECRET,
        { expiresIn: "1d" }
      );
  
      const newExpiry = Date.now() + ACCESS_TOKEN_LIFESPAN;
  
      return {
        ...token,
        accessToken: newAccessToken,
        accessTokenExpiry: newExpiry,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("Refresh token failed:", error);
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }
  }