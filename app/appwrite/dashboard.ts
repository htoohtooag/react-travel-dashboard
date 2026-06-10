import { user } from "~/constants";
import { appwriteConfig, tablesDB } from "./client";
import { parseTripData } from "~/lib/utils";

interface Row {
    [key: string]: any;
}

type FilterByDate = (
    items: Row[],
    key: string,
    start: string,
    end?: string,
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const startPrev = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    const [users, trips] = await Promise.all([
        tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
        }),
        tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tripTableId,
        }),
    ]);

    const filterByDate: FilterByDate = (items, key, start, end) => items.filter((item) => (
        item[key] >= start && (!end || item[key] <= end)
    )).length;
    // “From all items,
    // keep only those where
    // date >= start
    // AND (if end exists) date <= end
    // then return how many remain.”

    const filterUserByRole = (role: string) => {
        return users.rows.filter((u: Row) => u.status === role);
    };

    return {
        totalUsers: users.total,
        usersJoined: {
            currentMonth: filterByDate(users.rows, "joinedAt", startCurrent, undefined),
            lastMonth: filterByDate(users.rows, "joinedAt", startPrev, endPrev)  //. getting lastmonth between last month start and end
        },
        userRole: {
            total: filterUserByRole('user').length,
            currentMonth: filterByDate(
                filterUserByRole('user'),
                "joinedAt",
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUserByRole('user'),
                "joinedAt",
                startPrev,
                endPrev
            )
        },
        totalTrips: trips.total,
        tripsCreated: {
            currentMonth: filterByDate(trips.rows, "createdAt", startCurrent, undefined),
            lastMonth: filterByDate(trips.rows, "createdAt", startPrev, endPrev)
        },
    }
};

export const getUserGrowthPerDay = async () => {
    const users = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userTableId
    });

    const userGrowth = users.rows.reduce(
        (acc: { [key: string]: number }, user: Row) => {
            const date = new Date(user.joinedAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc; //. {Jan 5: 2}
        },
        {}
    ); 
    //prev (acc) -> init {} 
    // then we make {date}:number  //* add date and count 
    // then retun that acc {Jan 5: 2} 
    // Object.entries ->  [["Jan 5", 2]] 
    // loop that -> we arrya destrcution [day,count]

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

// | Method                 | Includes        | Example               |
// | ---------------------- | --------------- | --------------------- |
// | `toLocaleDateString()` | **Date only**   | Jan 5, 2026           |
// | `toLocaleTimeString()` | **Time only**   | 10:53 PM              |
// | `toLocaleString()`     | **Date + Time** | Jan 5, 2026, 10:53 PM |


// | Option             | Meaning               | Example |
// | ------------------ | --------------------- | ------- |
// | `month: "short"`   | Short month name      | Jan     |
// | `month: "long"`    | Full month name       | January |
// | `month: "numeric"` | Month number          | 1       |
// | `day: "numeric"`   | Day number            | 5       |
// | `day: "2-digit"`   | Day with leading zero | 05      |


export const getTripsCreatedPerDay = async () => {
    const trips = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripTableId
    });

    const tripsGrowth = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Row) => {
            const date = new Date(trip.createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(tripsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsByTravelStyle = async () => {
    const trips = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripTableId
    });

    const travelStyleCounts = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Row) => {
            const tripDetail = parseTripData(trip.tripDetails);

            if (tripDetail && tripDetail.travelStyle) {
                const travelStyle = tripDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};
