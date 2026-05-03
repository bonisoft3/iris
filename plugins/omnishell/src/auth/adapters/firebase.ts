import type { Auth as FirebaseAuth } from "firebase-admin/auth"
import type {
  BiometricAdapter,
  UserInfo,
  RegistrationResult,
  BiometricCredential,
  AuthenticationChallenge,
} from "../types"

export interface FirebaseAdapterConfig {
  auth: FirebaseAuth
}

export class FirebaseAdapter implements BiometricAdapter {
  type = "firebase" as const

  constructor(private config: FirebaseAdapterConfig) {}

  async isAvailable(): Promise<boolean> {
    return true
  }

  async startRegistration(_user: UserInfo): Promise<RegistrationResult> {
    return { challenge: "", options: {} }
  }

  async verifyRegistration(response: unknown): Promise<BiometricCredential> {
    return this.verifyAuthentication(response)
  }

  async startAuthentication(_userId?: string): Promise<AuthenticationChallenge> {
    return { challenge: "", options: {} }
  }

  async verifyAuthentication(response: unknown): Promise<BiometricCredential> {
    const idToken = (response as { idToken?: unknown })?.idToken
    if (typeof idToken !== "string") {
      throw new Error("FirebaseAdapter: response must include an idToken string")
    }
    const decoded = await this.config.auth.verifyIdToken(idToken)
    return {
      credentialId: decoded.uid,
      publicKey: new Uint8Array(0),
      counter: 0,
      deviceType: "firebase",
      backedUp: true,
    }
  }
}
