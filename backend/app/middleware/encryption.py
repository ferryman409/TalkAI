from cryptography.fernet import Fernet

from app.config import settings

_cipher: Fernet | None = None


def get_cipher() -> Fernet:
    global _cipher
    if _cipher is not None:
        return _cipher
    if not settings.encryption_key:
        raise RuntimeError("ENCRYPTION_KEY is not set")
    _cipher = Fernet(settings.encryption_key.encode())
    return _cipher


def encrypt_content(plaintext: str) -> str:
    if not plaintext:
        return plaintext
    cipher = get_cipher()
    return cipher.encrypt(plaintext.encode()).decode()


def decrypt_content(ciphertext: str) -> str:
    if not ciphertext:
        return ciphertext
    cipher = get_cipher()
    return cipher.decrypt(ciphertext.encode()).decode()
