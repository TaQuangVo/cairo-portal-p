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
  }
}
