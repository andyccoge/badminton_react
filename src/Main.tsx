import { StrictMode, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

import Box from '@mui/material/Box';
import Playdates from './pages/Playdates'
import Users from './pages/Users'
import Playdate from './pages/Playdate'
import Play from './pages/Play'

import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

// 先設定模式（可以之後動態改）
const mode= "light"; // light, dark

// let testCount= 0;
function Main() {
  const [body_block, setBodyBlock] = useState(false);
  const updateBodyBlock = (newBodyBlock) => {
    // console.log(String(testCount++)+':'+newBodyBlock);
    setBodyBlock(newBodyBlock);
  };

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline /> {/* 自動套用背景、文字顏色 */}
      <StrictMode>
        <Box className="pl-2 pr-2 pb-3">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Playdates updateBodyBlock={updateBodyBlock}/>} />
              <Route path="/users" element={<Users updateBodyBlock={updateBodyBlock}/>} />
              <Route path="/playdate" element={<Playdate updateBodyBlock={updateBodyBlock}/>} />
              <Route path="/play" element={<Play updateBodyBlock={updateBodyBlock}/>} />
            </Routes>
          </BrowserRouter>
        </Box>
        <Box className="fixed w-full h-full top-0 left-0 bg-gray-950 opacity-25 flex items-center justify-center" 
            sx={{ zIndex: 99999, display:body_block?'flex':'none',}}>
          <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
            <CircularProgress color="inherit" />
          </Stack>
        </Box>
      </StrictMode>
    </ThemeProvider>
  )
}

export default Main