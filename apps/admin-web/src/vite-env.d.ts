/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_QR_SCANNER: string;
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_QR_CODE_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}