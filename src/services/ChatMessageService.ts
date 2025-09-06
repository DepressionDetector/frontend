//  src/services/ChatMessageService.ts

import { getLocalStoragedata } from "../helpers/Storage";

const API_BASE = "http://localhost:8080";

export async function saveMessage(message: string, sessionID: string, sender: string) {
    const token = getLocalStoragedata("token");


    try {
        const response = await fetch(`${API_BASE}/chat/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message, sessionID, sender }),
        });
        return await response.json();
    } catch (err) {
        console.error("Error saving message:", err);
    }
}

export async function fetchChatHistory(sessionID: string) {
    const token = getLocalStoragedata("token");

    try {
        const response = await fetch(`${API_BASE}/chat/history/${sessionID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return await response.json();
    } catch (err) {
        console.error("Error fetching history:", err);
        return [];
    }
}

export async function createNewSession() {
    const token = getLocalStoragedata("token");

    try {
        const response = await fetch(`${API_BASE}/session/start`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        return data.sessionID;
    } catch (err) {
        console.error("Error creating session:", err);
    }
}

export async function endCurrentSession(sessionID: string) {
    const token = getLocalStoragedata("token");

    try {
        const response = await fetch(`${API_BASE}/session/end`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionID })
        });

        return await response.json();
    } catch (err) {
        console.error("Error ending session:", err);
    }
}

export async function fetchAllSummaries(): Promise<string[]> {
    const token = getLocalStoragedata("token");

    try {
        const response = await fetch(`${API_BASE}/sessionSummary/session-summaries`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Fetched summaries:", response);
        const data = await response.json();
        return data.summaries || [];
    } catch (error) {
        console.error("Error fetching summaries:", error);
        return [];
    }
}