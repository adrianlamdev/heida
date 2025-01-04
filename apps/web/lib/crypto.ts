import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ENCRYPTION_IV_LENGTH = 16;

export interface EncryptedData {
  encryptedData: string;
  iv: string;
}

/**
 * Encrypts text using AES-256-CBC encryption
 * @param text The text to encrypt
 * @returns Object containing the encrypted data and initialization vector
 */
export function encryptText(text: string): EncryptedData {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes long (64 hex characters)");
  }

  const iv = randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = createCipheriv("aes-256-cbc", keyBuffer, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts text that was encrypted using AES-256-CBC
 * @param encryptedData The encrypted text in hex format
 * @param iv The initialization vector in hex format
 * @returns The decrypted text
 */
export function decryptText(encryptedData: string, iv: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes long (64 hex characters)");
  }

  const decipher = createDecipheriv(
    "aes-256-cbc",
    keyBuffer,
    Buffer.from(iv, "hex"),
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generates a random encryption key suitable for AES-256
 * @returns A 32-byte random key in hex format
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}

console.log(generateEncryptionKey());
