import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Button } from "@mui/material";
import { getTheme } from "./theme";

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import Box from '@mui/material/Box';
import Playdates from './pages/Playdates'
import Users from './pages/Users'
import Playdate from './pages/Playdate'

// 先設定模式（可以之後動態改）
const mode= "light"; // light, dark
createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={getTheme(mode)}>
    <CssBaseline /> {/* 自動套用背景、文字顏色 */}
    <StrictMode>
      <Box className="pl-2 pr-2 pb-3">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Playdates />} />
            <Route path="/users" element={<Users />} />
            <Route path="/playdate" element={<Playdate />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </StrictMode>
  </ThemeProvider>
)