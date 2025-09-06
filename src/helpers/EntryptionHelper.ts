import CryptoJS from "crypto-js";

const key = process.env.REACT_APP_ENCRYPTION_KEY as string | undefined;
console.log(key)
if (!key) {
  throw new Error("Encryption key (REACT_APP_ENCRYPTION_KEY) is not set in environment variables");
}

const ENCRYPTION_KEY = key;

export function encrypt(text: unknown): string {
  const jsonString = JSON.stringify(text);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
}

export function decrypt<T = unknown>(data: string): T {
  try {
    const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted) as T;
  } catch {
    return data as unknown as T;
  }
}

export function encryptRequest(obj: unknown) {
  const data = CryptoJS.AES.encrypt(
    JSON.stringify(obj),
    ENCRYPTION_KEY
  ).toString();
  return { key: "web", data };
}

export function decryptResponse(response: { data: string | null; message?: string }) {
  if (response.data !== null) {
    try {
      const bytes = CryptoJS.AES.decrypt(response.data, ENCRYPTION_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      const parsedData = JSON.parse(decryptedText);
      return {
        data: parsedData,
        message: response.message,
      };
    } catch {
      return response;
    }
  }
  return response;
}
