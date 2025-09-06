import { getLocalStoragedata } from "../helpers/Storage";

const API_BASE = "http://localhost:8080";

export async function savePHQ9Answer(
    sessionID: string,
    questionID: number,
    question: string,
    answer: string
) {
    const token = getLocalStoragedata("token");
    try {
        const res = await fetch(`${API_BASE}/phq9/phq9-save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionID, questionID, question, answer }),

        });

        console.log("Response from savePHQ9Answer:", res);
        return await res.json();
    } catch (err) {
        console.error("Error saving PHQ-9:", err);
        return null;
    }
}
