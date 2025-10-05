/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_STAGE: string
  // 你可以加上其他自訂變數
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
