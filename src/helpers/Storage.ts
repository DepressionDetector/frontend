import { decrypt, encrypt } from "./EntryptionHelper";

export function setLocalStorageData(key: string, data: any): void {
  const encryptData = encrypt(data);
  localStorage.setItem(key, encryptData);
}

export function getLocalStoragedata(key: string): string | null {
  const data = localStorage.getItem(key);
  return data !== null ? decrypt<string>(data) : null;
}
