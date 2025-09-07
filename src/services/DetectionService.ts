// services/DetectionService.ts
import { getLocalStoragedata } from "../helpers/Storage";

const metadataServiceURL = "http://localhost:8000/";

// NEW: align type with backend response
export type PHQ9Level =
    | "Minimal"
    | "Mild"
    | "Moderate"
    | "Moderately Severe"
    | "Severe";

export interface ClassifierResult {
    phq9_score: number;
    level: PHQ9Level;
}

// Sends numbered strings: ["1. ...", "2. ...", ...]
export async function getClassifierResult(
    phq9Answers: string[]
): Promise<ClassifierResult> {
    const res = await fetch(`${metadataServiceURL}detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phq9Answers }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Detection failed with ${res.status}`);
    }
    return res.json();
}


// --- unchanged: other API ---
const API_BASE = "http://localhost:8080";

export async function getDepressionLevel() {
    const token = getLocalStoragedata("token");
    const res = await fetch(`${API_BASE}/levelDetection/depression-index`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
}
