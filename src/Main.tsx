import * as React from 'react';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

import Box from '@mui/material/Box';
import Playdates from './pages/Playdates'
import Users from './pages/Users'
import Playdate from './pages/Playdate'
import Play from './pages/Play'

import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import {TransitionProps} from '@mui/material/transitions';
import {Slide, Button} from '@mui/material';
import {Dialog, DialogActions, DialogContent,DialogContentText,DialogTitle} from '@mui/material';

// 先設定模式（可以之後動態改）
const mode= "light"; // light, dark

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// let testCount= 0;
function Main() {
  const [body_block, setBodyBlock] = React.useState(false);
  const updateBodyBlock = (newBodyBlock) => {
    // console.log(String(testCount++)+':'+newBodyBlock);
    setBodyBlock(newBodyBlock);
  };

  const [confirmModelStatus, setConfirmModelStatus] = React.useState(false);
  const [confirmModelTitle, setConfirmModelTitle] = React.useState('');
  const [confirmModelMessage, setConfirmModelMessage] = React.useState('');
  const [confirmModelFunctionName, setConfirmModelFunctionName] = React.useState('');
  const [confirmModelFunction, setConfirmModelFunction] = React.useState<Function>(()=>{ return false; });
  const showConfirmModelStatus = (
    title: string,
    message: string,
    do_function_name: string = '',
    do_function: Function = ()=>{ return false; }
  )=>{
    setConfirmModelTitle(title);
    setConfirmModelMessage(message);
    setConfirmModelFunctionName(do_function_name);
    setConfirmModelFunction(() => async () => { 
      const modelStatus = await do_function();
      setConfirmModelStatus(modelStatus);
    });
    setConfirmModelStatus(true);
  }

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline /> {/* 自動套用背景、文字顏色 */}
      <React.StrictMode>
        <Box className="pl-2 pr-2 pb-3">
          <BrowserRouter>
            <Routes>
              {/* 預設首頁跳轉至「打球日管理」 */}
              <Route path="/" element={<Playdates updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>} />

              <Route path="/playdates" element={<Playdates updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>} />
              <Route path="/users" element={<Users updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>} />
              <Route path="/playdate" element={<Playdate updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>} />
              <Route path="/play" element={<Play updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>} />
            </Routes>
          </BrowserRouter>
        </Box>
        <Box className="fixed w-full h-full top-0 left-0 bg-gray-950 opacity-25 flex items-center justify-center" 
            sx={{ zIndex: 99999, display:body_block?'flex':'none',}}>
          <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
            <CircularProgress color="inherit" />
          </Stack>
        </Box>

        <Dialog
          open={confirmModelStatus}
          slots={{
            transition: Transition,
          }}
          keepMounted
          onClose={()=>{setConfirmModelStatus(false)}}
          aria-describedby="confirmModel"
        >
          <DialogTitle>{confirmModelTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirmModel">
              {confirmModelMessage.split("\n").map((sentence, idx) => (
                <React.Fragment key={'DialogSentence-'+idx}>
                  {sentence}<br />
                </React.Fragment>
              ))}
            </DialogContentText>
          </DialogContent>
          {confirmModelFunctionName &&
            <DialogActions>
              <Button onClick={()=>{setConfirmModelStatus(false)}} 
                      color="error" sx={{mr:'1rem'}}
              >取消</Button>
              <Button onClick={()=>{confirmModelFunction();}}
              >{confirmModelFunctionName}</Button>
            </DialogActions>
          }
        </Dialog>
      </React.StrictMode>
    </ThemeProvider>
  )
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Main />
    </SnackbarProvider>
  );
}