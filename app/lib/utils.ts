import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMMM DD, YYYY");
};

export function parseMarkdownToJson(markdownText: string): unknown | null {
    // Attempt 1: Check for JSON inside Markdown code blocks (Old behavior)
    // This regex looks for ```json ... ```
    console.log(markdownText,"Text from ai ")
    const markdownRegex = /```json\n([\s\S]+?)\n```/;
    const markdownMatch = markdownText.match(markdownRegex);
    if (markdownMatch && markdownMatch[1]) {
        console.log("mark donw match and i work")
        try {
            return JSON.parse(markdownMatch[1]);
        } catch (error) {
            console.error("Error parsing JSON inside markdown block:", error);
            return null;
        }
    }

    try {
        // Optional: Trim whitespace just in case
        const cleanedText = markdownText.trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing raw JSON string:", error);
        console.error("Text that failed:", markdownText);
        return null;
    }
}
  


export function parseTripData(jsonString: string): Trip | null {
    try {
        const data: Trip = JSON.parse(jsonString);
        return data;
    } catch (error) {
        console.error("Failed to parse trip data:", error);
        return null;
    }
}

export function getFirstWord(input: string = ""): string {
    return input.trim().split(/\s+/)[0] || "";
}

export const calculateTrendPercentage = (
    countOfThisMonth: number,
    countOfLastMonth: number
): TrendResult => {
    if (countOfLastMonth === 0) {
        return countOfThisMonth === 0
            ? { trend: "no change", percentage: 0 }
            : { trend: "increment", percentage: 100 };
    }

    const change = countOfThisMonth - countOfLastMonth;
    const percentage = Math.abs((change / countOfLastMonth) * 100);

    if (change > 0) {
        return { trend: "increment", percentage };
    } else if (change < 0) {
        return { trend: "decrement", percentage };
    } else {
        return { trend: "no change", percentage: 0 };
    }
};

export const formatKey = (key: keyof TripFormData) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};