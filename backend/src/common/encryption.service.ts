import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const ALG = 'aes-256-gcm';
const IV_LEN = 16;
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor() {
    const envKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (envKey && /^[0-9a-fA-F]{64}$/.test(envKey)) {
      this.key = Buffer.from(envKey, 'hex');
    } else {
      this.key = crypto.scryptSync(envKey || 'default-dev-key-change-in-production', 'salt', KEY_LEN);
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALG, this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, enc]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    const buf = Buffer.from(ciphertext, 'base64');
    const iv = buf.subarray(0, IV_LEN);
    const authTag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
    const enc = buf.subarray(IV_LEN + AUTH_TAG_LEN);
    const decipher = crypto.createDecipheriv(ALG, this.key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(enc).toString('utf8') + decipher.final('utf8');
  }
}
