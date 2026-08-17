import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'crypto';

/**
 * AES helpers compatible with CryptoJS `AES.encrypt` / `AES.decrypt` passphrase mode.
 *
 * @remarks
 * CryptoJS defaults to OpenSSL-compatible salted ciphertext (`Salted__` + 8-byte salt)
 * and EVP_BytesToKey (MD5) key derivation for AES-256-CBC. First-contact pin session
 * values must keep this format so in-flight sessions and existing tests still decrypt.
 */

const SALTED_PREFIX = Buffer.from('Salted__');
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 8;

/**
 * Derives AES key and IV the same way CryptoJS / OpenSSL passphrase mode does.
 *
 * @param password - Passphrase (first-contact pin / access code)
 * @param salt - 8-byte salt from the ciphertext header
 */
function evpBytesToKey(password: string, salt: Buffer): {key: Buffer; iv: Buffer} {
  const result: Buffer[] = [];
  let current = Buffer.alloc(0);
  while (Buffer.concat(result).length < KEY_LEN + IV_LEN) {
    current = createHash('md5')
      .update(Buffer.concat([current, Buffer.from(password, 'utf8'), salt]))
      .digest();
    result.push(current);
  }
  const derived = Buffer.concat(result);
  return {
    key: derived.subarray(0, KEY_LEN),
    iv: derived.subarray(KEY_LEN, KEY_LEN + IV_LEN),
  };
}

/**
 * Encrypts plaintext with a passphrase, matching CryptoJS `AES.encrypt(...).toString()`.
 *
 * @param plaintext - UTF-8 string to encrypt
 * @param passphrase - Passphrase used as the CryptoJS passphrase
 * @returns Base64 OpenSSL-compatible ciphertext
 */
export function encryptAes(plaintext: string, passphrase: string): string {
  const salt = randomBytes(SALT_LEN);
  const {key, iv} = evpBytesToKey(passphrase, salt);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([SALTED_PREFIX, salt, encrypted]).toString('base64');
}

/**
 * Decrypts CryptoJS / OpenSSL salted AES ciphertext with a passphrase.
 *
 * @param ciphertext - Base64 ciphertext from {@link encryptAes} or CryptoJS
 * @param passphrase - Passphrase used at encryption time
 * @returns UTF-8 plaintext, or an empty string if decryption fails
 */
export function decryptAes(ciphertext: string, passphrase: string): string {
  try {
    const raw = Buffer.from(ciphertext, 'base64');
    if (raw.length < SALTED_PREFIX.length + SALT_LEN || !raw.subarray(0, SALTED_PREFIX.length).equals(SALTED_PREFIX)) {
      return '';
    }
    const salt = raw.subarray(SALTED_PREFIX.length, SALTED_PREFIX.length + SALT_LEN);
    const data = raw.subarray(SALTED_PREFIX.length + SALT_LEN);
    const {key, iv} = evpBytesToKey(passphrase, salt);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}
