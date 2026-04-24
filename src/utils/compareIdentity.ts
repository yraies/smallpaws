import CryptoJS from "crypto-js";

export function getCompareIdentity(formId: string): string {
  return CryptoJS.SHA256(`compare:${formId}`).toString();
}
