import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;
const KEY_HEX_LENGTH = KEY_BYTE_LENGTH * 2;

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    this.key = this.resolveKey(
      this.config.get<string>('ENCRYPTION_KEY', ''),
    );
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(cipherText: string): string {
    const buffer = Buffer.from(cipherText, 'base64');
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  private resolveKey(hexKey: string): Buffer {
    const normalized = hexKey.trim();
    if (!/^[0-9a-fA-F]+$/.test(normalized)) {
      throw new Error(
        'ENCRYPTION_KEY doit être une chaîne hexadécimale (0-9, a-f uniquement)',
      );
    }
    if (normalized.length !== KEY_HEX_LENGTH) {
      throw new Error(
        `ENCRYPTION_KEY doit faire exactement ${KEY_HEX_LENGTH} caractères hex (${KEY_BYTE_LENGTH} octets pour AES-256). Longueur actuelle : ${normalized.length}`,
      );
    }
    const key = Buffer.from(normalized, 'hex');
    if (key.length !== KEY_BYTE_LENGTH) {
      throw new Error(
        `ENCRYPTION_KEY invalide : ${key.length} octets décodés au lieu de ${KEY_BYTE_LENGTH}`,
      );
    }
    return key;
  }
}
