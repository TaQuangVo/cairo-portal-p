import NextAuthJWT  from "next-auth";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        personalNumber: string;
        role: "admin" | "user";
        isActive: boolean;
        email?: string | null;
        givenName?: string | null;
        surname?: string | null;
        phoneNumber?: string | null;
        createdAt?: Date;
        updatedAt?: Date;

        accessToken: string;
        refreshToken: string;
        accessTokenExpiry: number; // ms timestamp

        error?: 'SessionExpired' | 'RefreshAccessTokenError';
    }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      personalNumber: string;
      role: "admin" | "user";
      isActive: boolean;
      email?: string | null;
      givenName?: string | null;
      surname?: string | null;
      phoneNumber?: string | null;
      createdAt?: Date;
      updatedAt?: Date;

      accessTokenExpiry: number; // ms timestamp
    };
  }

  interface User {
    id: string;
    personalNumber: string;
    role: "admin" | "user";
    isActive: boolean;
    email?: string | null;
    givenName?: string | null;
    surname?: string | null;
    phoneNumber?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number; // ms timestamp
  }
}