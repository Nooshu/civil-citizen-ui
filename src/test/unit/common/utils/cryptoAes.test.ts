import {decryptAes, encryptAes} from 'common/utils/cryptoAes';

describe('cryptoAes', () => {
  it('round-trips plaintext with a passphrase', () => {
    const passphrase = 'H4WYG26R6PA9';
    const ciphertext = encryptAes('yes', passphrase);
    expect(ciphertext.startsWith('U2FsdGVkX1')).toBe(true);
    expect(decryptAes(ciphertext, passphrase)).toBe('yes');
  });

  it('decrypts existing CryptoJS OpenSSL ciphertext used by first-contact tests', () => {
    const ciphertext = 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=';
    expect(decryptAes(ciphertext, 'H4WYG26R6PA9')).toBe('yes');
  });

  it('returns empty string for wrong passphrase or invalid input', () => {
    const ciphertext = encryptAes('yes', 'correct');
    expect(decryptAes(ciphertext, 'wrong')).toBe('');
    expect(decryptAes('not-valid-base64-ciphertext!!!', 'correct')).toBe('');
  });
});
