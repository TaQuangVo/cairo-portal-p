import { ObjectId } from "mongodb";
import { getUserCollection } from "../lib/db";
import { DBUser, UserCreate, UserUpdate } from "../lib/db.type";

  
export async function createUser(user: UserCreate): Promise<DBUser> {
    try {
        const userCol = await getUserCollection();

        const newUser: DBUser = {
            _id: new ObjectId().toHexString(), // Generate a new MongoDB ObjectId
            createdAt: new Date(),
            updatedAt: new Date(),
            ...user, // Spread the user properties
        };

        const result = await userCol.insertOne(newUser);

        if (!result.acknowledged) {
            throw new Error("User creation failed");
        }

        return newUser;
    } catch (error) {
        console.log(error)
        throw new Error(`Failed to create user:  ${error instanceof Error ? error.message : error}`);
    }
}

export async function getUsers(): Promise<DBUser[]> {
    try {
        const userCol = await getUserCollection();
        
        const users = await userCol.find().toArray();
        
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error(`Failed to fetch users:  ${error instanceof Error ? error.message : error}`);
    }
}

export async function getUserByPersonalNumber(personalNumber: string): Promise<DBUser | null> {
    try {
        const userCol = await getUserCollection();
        
        const user = await userCol.findOne({ personalNumber: personalNumber });

        return user;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error(`Failed to fetch user by ID: ${error instanceof Error ? error.message : error}`);
    }
}

export async function getUserById(id: string): Promise<DBUser | null> {
    try {
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid ObjectId format");
        }

        const userCol = await getUserCollection();
        
        const user = await userCol.findOne({ _id: id });

        return user;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error(`Failed to fetch user by ID: ${error instanceof Error ? error.message : error}`);
    }
}
  
export async function updateUser(user: DBUser): Promise<DBUser | null> {
    try {
        const userCol = await getUserCollection();

        if (!ObjectId.isValid(user._id)) {
            throw new Error("Invalid ObjectId format");
        }

        // Perform the update
        const result = await userCol.updateOne(
            { _id: user._id },  // Find user by _id
            {
                $set: {
                    personalNumber: user.personalNumber,
                    role: user.role,
                    isActive: user.isActive,

                    email: user.email,
                    givenName: user.givenName,
                    surname: user.surname,
                    phoneNumber: user.phoneNumber,

                    updatedAt: new Date(),  // Set updatedAt to the current date
                },
            }
        );

        // If the user was not found or no document was modified
        if (result.matchedCount === 0) {
            return null;
        }

        // Return the updated user data (you could choose to return the updated document)
        const updatedUser = { ...user, updatedAt: new Date() };
        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error(`Failed to update user: ${error instanceof Error ? error.message : error}`);
    }
}
  
export async function deactivateUser(id: string): Promise<void|null> {
    return null;
}

export async function activateUser(id: string): Promise<void|null> {
    return null;
}
