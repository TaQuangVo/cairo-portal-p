export type DBUser = {
    _id: string
    personalNumber: string
    role: "admin" | "user";
    isActive: boolean;

    email?: string | null
    givenName?: string | null
    surname?: string | null
    phoneNumber?: string | null

    createdAt: Date;
    updatedAt: Date;
};

export type UserCreate = Omit<DBUser, "_id" | "createdAt" | "updatedAt">;
export type UserUpdate = Omit<DBUser, "createdAt" | "updatedAt">;