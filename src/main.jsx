/**
 * 🚨 注意：
 * Vite 在 build 模式時會從 index.html 找入口檔，
 * 官方預設是 main.jsx 或 main.js。
 * 如果改成其他檔名（例如 app.jsx），
 * dev 模式雖然能跑，但 build 會找不到入口檔導致部署失敗。
 * 
 * ❗ 請務必保留為 main.jsx
 */
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import Main from './Main.tsx'

createRoot(document.getElementById('root')).render(<Main/>)
