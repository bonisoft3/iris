import { createAuth } from "../../../src/index"
import { LocalStorageAdapter } from "../../../src/auth/storage/local-storage"
import { createBrowserSessionManager } from "../../../src/auth/session-browser"
import type { BiometricAdapter, BiometricCredential, UserInfo } from "../../../src/auth/types"

// Fake biometric adapter for development — auto-approves all challenges
class DevBiometricAdapter implements BiometricAdapter {
  type = "dev-fake"
  async isAvailable() { return true }

  async startRegistration(_user: UserInfo) {
    return { challenge: crypto.randomUUID(), options: {} }
  }

  async verifyRegistration(_response: unknown): Promise<BiometricCredential> {
    return {
      credentialId: crypto.randomUUID(),
      publicKey: new Uint8Array([1, 2, 3, 4]),
      counter: 0,
      deviceType: "singleDevice",
      backedUp: false,
    }
  }

  async startAuthentication(_userId?: string) {
    return { challenge: crypto.randomUUID(), options: {} }
  }

  async verifyAuthentication(_response: unknown): Promise<BiometricCredential> {
    return {
      credentialId: "dev-credential",
      publicKey: new Uint8Array([1, 2, 3, 4]),
      counter: 1,
      deviceType: "singleDevice",
      backedUp: false,
    }
  }
}

const AUTH_SECRET = "omnishell-dev-secret-not-for-production"

// Use a mock storage for SSR (server-side), real localStorage for browser
function getStorage(): Storage {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    return localStorage
  }
  // Minimal mock for SSR — won't persist but won't crash
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    clear() { data.clear() },
    getItem(key: string) { return data.get(key) ?? null },
    key(index: number) { return [...data.keys()][index] ?? null },
    removeItem(key: string) { data.delete(key) },
    setItem(key: string, value: string) { data.set(key, value) },
  }
}

export const authStorage = new LocalStorageAdapter(getStorage())

export const sessionManager = createBrowserSessionManager({
  secret: AUTH_SECRET,
  storage: getStorage(),
})

export const auth = createAuth({
  biometric: new DevBiometricAdapter(),
  storage: authStorage,
  secret: AUTH_SECRET,
})
