import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';

import { Box, Grid, Stack, Typography} from '@mui/material';
import {Card, CardContent,} from '@mui/material';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CampaignIcon from '@mui/icons-material/Campaign';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import UserNameCard, {MyChildRef as UserNameCardMyChildRef, UserType} from '../components/UserNameCard';

interface CourtType {
  id:number, code:string, type:number,
  duration:number, timer:any, usersIdx:number[],
}

export type MyChildRef = { // 子暴露方法給父
  getUserNameCards: () => Array<React.RefObject<UserNameCardMyChildRef | null>>;
  scrollToSelf: () => void;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  court_idx: number,
  court:CourtType,
  users:UserType[],
  vertical?: boolean,
  setCourt?: (items:any) => void;
  courtsPrepare?: CourtType[];
  userIdxMatch?: number[];
  setUserIdxMatch?: (items:any) => void;
  clickUserName: (refIdx:number) => void;
};

function Court(
  { 
    updateBodyBlock, court_idx, court, users,
    clickUserName, vertical=false,
    setCourt, courtsPrepare=[], userIdxMatch=[], setUserIdxMatch,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  React.useImperativeHandle(ref, () => ({
    getUserNameCards: () => { return [
      UserNameCardRef1,
      UserNameCardRef2,
      UserNameCardRef3,
      UserNameCardRef4,
    ]; },
    scrollToSelf: () => {
      if (!rootRef.current) return;
      const top = rootRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - 16, // 1rem ≈ 16px
        behavior: "smooth",
      });
      // rootRef.current?.scrollIntoView({
      //   behavior: "smooth",
      //   block: "start",
      // });
    }
  }));

  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const UserNameCardRef1 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef2 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef3 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef4 = React.useRef<UserNameCardMyChildRef>(null);

  const changeCourt = () => {
    const donwIdx = court.usersIdx;
    /*比賽idx排除本次下場的*/
    userIdxMatch = userIdxMatch.filter((xx)=>{ return donwIdx.indexOf(xx)==-1; });

    let nextIdx = [-1,-1,-1,-1], nextCourtIdx = -1;
    for (let yy = 0; yy < courtsPrepare.length; yy++) {
      const idxs = courtsPrepare[yy].usersIdx;
      const sum = idxs.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      if(sum==-4){ continue; } /*有設定人員*/
      /*檢查場上人員是否重複*/
      const set1 = new Set(userIdxMatch);
      if(idxs.filter(item => set1.has(item)).length > 0){
        continue;
      }
      nextIdx = JSON.parse(JSON.stringify(idxs));
      nextCourtIdx = nextCourtIdx;
      break;
    }
    console.log(nextIdx);
    
    /*更新球員下場&上場*/
    userIdxMatch.concat(nextIdx); /*比賽idx加入本次上場的*/
    if(setUserIdxMatch){ setUserIdxMatch(userIdxMatch); }

    /*設定場地球員(上場)*/
    if(setCourt){
      setCourt(prev =>
        prev.map((xx) => (
          xx.id==court.id ? { ...xx, usersIdx: nextIdx, } : xx
        ))
      );
    }

    /*更改球員等待&比賽場數*/

    /*添加比賽紀錄*/

  }
  const setTimerStop = () => {
    if(setCourt){
      if(court.timer){
        clearInterval(court.timer);
      }
      setCourt(prev =>
        prev.map((xx) => (
          xx.id==court.id ? { ...xx, timer: null, } : xx
        ))
      );
    }
  }
  const setTimerStart = () => {
    if(setCourt){
      court.timer = setInterval(() => {
        court.duration += 1;
        setCourt(prev =>
          prev.map((xx) => (
            xx.id==court.id ? { ...xx, duration: court.duration, } : xx
          ))
        );
      }, 1000);
    }
  }

  return (<>
    <Box position={'relative'} ref={rootRef}>
      <Card sx={{ 
        maxWidth: 345,
        backgroundSize: '100% 100%',
        bgcolor:(court && court.type==1)?'#00aa55':'#ffcc33',
        backgroundImage: "url(/img/"+(vertical?"badminton_court_v_e.png":"badminton_court_e.png")+")",
      }}>
        <CardContent style={{padding:0,}}>
          <Grid container spacing={1} padding={vertical?'5px 10px':'10px 0'}
                alignItems={'center'} justifyContent={'center'}>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1}
                    justifyContent={'space-around'} alignItems={'center'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[0]}
                              user={users[court.usersIdx[0]]}
                              vertical={vertical}
                              onClick={()=>{clickUserName(0)}}
                              ref={UserNameCardRef1}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[1]}
                              user={users[court.usersIdx[1]]}
                              vertical={vertical}
                              onClick={()=>{clickUserName(1)}}
                              ref={UserNameCardRef2}
                ></UserNameCard>
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 2, md:1}} 
                  display={'flex'} justifyContent={'center'}>
              <Stack direction={vertical?'row':'column'} display={'flex'} alignItems={'center'}>
                <Typography sx={{pr:vertical?'0.5rem':0,}}>
                  {court && court.code}
                </Typography>
                <EditSquareIcon />
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1}
                    justifyContent={'space-around'} alignItems={'center'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[2]}
                              user={users[court.usersIdx[2]]}
                              vertical={vertical}
                              onClick={()=>{clickUserName(2)}}
                              ref={UserNameCardRef3}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[3]}
                              user={users[court.usersIdx[3]]}
                              vertical={vertical}
                              onClick={()=>{clickUserName(3)}}
                              ref={UserNameCardRef4}
                ></UserNameCard>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
    <Box borderRadius={'0 0 10px 10px'} margin={'0 5px'} bgcolor={'#ff5050'} color={'#ffffff'}>
      <Grid container spacing={0} margin={'0 5px'} padding={'5px 0'} justifyContent={'center'}>
        <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <TipsAndUpdatesIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'/>
        </Grid>
        {setCourt && <>
          <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <AutorenewIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
              onClick={changeCourt} />
          </Grid>
          <Grid size={4} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {functions.formatSeconds(court.duration)}
          </Grid>
          <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {court.timer && <>
              <PauseIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
                onClick={setTimerStop} />
            </>}
            {!court.timer && <>
              <PlayArrowIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
                onClick={setTimerStart} />
            </>}
          </Grid>
          <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <CampaignIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'/>
          </Grid>
        </>}
      </Grid>
    </Box>
  </>)
}
export default React.forwardRef<MyChildRef, MyChildProps>(Court);