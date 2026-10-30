
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

import { app } from "./firebase";

const siteKey = import.meta.env
  .VITE_RECAPTCHA_ENTERPRISE_SITE_KEY as string | undefined;

let initialized = false;

export function setupAppCheck() {
  if (initialized) return;

  if (!siteKey) {
    console.warn("Falta la clave de sitio de App Check");
    return;
  }

  // Solo en desarrollo local.
  // Firebase generará un token de depuración en la consola.
  if (import.meta.env.DEV) {
    (
      globalThis as typeof globalThis & {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
      }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  initialized = true;
}
