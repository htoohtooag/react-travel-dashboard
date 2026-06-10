import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, database, tablesDB } from "./client";
import { redirect } from "react-router";


// https://appwrite.io/docs/products/auth/oauth2
export const loginWithGoogle = async () => {
    try {
        const resposne = account.createOAuth2Session({
            provider: OAuthProvider.Google,
            success: import.meta.env.VITE_BASE_URL,
            failure: `${import.meta.env.VITE_BASE_URL}/sign-in`
        });
        console.log(resposne, "login with google")
    } catch (e) {
        console.log('loginWith Google', e);
    }
};

// https://appwrite.io/docs/references/cloud/client-web/account
export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect('/sign-in');

        const { rows } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            queries: [
                Query.equal("accountId", user.$id),
                Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
            ]
        });
        return rows.length > 0 ? rows[0] : redirect("/sign-in")
    } catch (error) {
        console.error("Error fetching user:", error);
        return null
    }
};

export const logoutUser = async () => {
    try {
        await account.deleteSession('current');
        return true;
    } catch (e) {
        console.log("logout error :", e);
        return false;
    }
};


export const getGooglePicture = async () => {
    try {
        const session = await account.getSession('current');
        console.log("session in getGoogle picture", session)
        const accessToken = session.providerAccessToken;

        if (!accessToken) {
            throw new Error('No access token available');
        }

        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile photo');
        }

        const data = await response.json();
        const photoUrl = data.photos && data.photos.length > 0 ? data.photos[0].url : null;

        return photoUrl;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const storeUserData = async () => {
    try {
        const user = await account.get();
        if (!user) return null;

        const { rows } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            queries: [
                Query.equal('accountId', user.$id)
            ]
        });

        if (rows.length > 0) return rows[0];

        const imageUrl = await getGooglePicture();

        //=> Create new user  
        const createdUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: imageUrl,
                joinedAt: new Date().toISOString(),
            }
        );

        if (!createdUser.$id) redirect("/sign-in");
    } catch (error) {
        console.error("Error storing user data:", error);
    }
};

// export const getExistingUser = async (id: string) => {
//     try {
//         const { documents, total } = await database.listDocuments(
//             appwriteConfig.databaseId,
//             appwriteConfig.userTableId,
//             [Query.equal("accountId", id)]
//         );
//         console.log(documents, "documents n getexistin user", total); // {$collectionId: "users",$databaseId: "695952a50005db8b5064",$id: "695b8e2d00126c401f4b",$createdAt: "...",$updatedAt: "...",$permissions: [...],$sequence: 1, accountId: "695b8d0c7487af4988ec",email: "htoohtooaung22ag@gmail.com",imageUrl: "...",joinedAt: "...",name: "Htoo htoo Aung",status: "user"}
//         return total > 0 ? documents[0] : null;
//     } catch (error) {
//         console.error("Error fetching user:", error);
//         return null;
//     }
// };

//=> New Version with tablesDB
export const getExistingUser = async (accountId: string) => {
    try {
        const { rows, total } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            queries: [Query.equal("accountId", accountId)]
        });

        // console.log(rows, "rows in getExistingUser", total);  // {$collectionId: "users",$databaseId: "695952a50005db8b5064",$id: "695b8e2d00126c401f4b",$createdAt: "...",$updatedAt: "...",$permissions: [...],$sequence: 1, accountId: "695b8d0c7487af4988ec",email: "htoohtooaung22ag@gmail.com",imageUrl: "...",joinedAt: "...",name: "Htoo htoo Aung",status: "user"}

        return total > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { rows: users, total } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            queries: [
                Query.limit(limit),
                Query.offset(offset)
            ]
        });

        if (total === 0) return { users: [], total };
        return { users, total };
    } catch (e) {
        console.log("Error fetching users");
        return { users: [], total: 0 }
    }
}