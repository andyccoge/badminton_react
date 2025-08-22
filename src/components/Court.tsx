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
  id:number, code:string, type:number, duration:number,
  usersIdx:number[],
}

export type MyChildRef = { // 子暴露方法給父
  getUserNameCards: () => Array<React.RefObject<UserNameCardMyChildRef | null>>;
  scrollToSelf: () => void;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  court_idx: number,
  courts: CourtType[],
  users:UserType[],
  clickUserName: (refIdx:number) => void;
  vertical?: boolean,
  setCourts?: (items:any) => void;
  userIdxMatch?: number[];
  setUserIdxMatch?: (items:any) => void;
  setUsers?: (items:any) => void;
};

function Court(
  { 
    updateBodyBlock, court_idx, courts, users,
    clickUserName, vertical=false,
    setCourts, userIdxMatch=[], setUserIdxMatch, setUsers,
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

  const court = courts[court_idx];

  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const [timer, setTimer] = React.useState<any>(null);
  const UserNameCardRef1 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef2 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef3 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef4 = React.useRef<UserNameCardMyChildRef>(null);

  /*檢查場上人員是否皆未設定*/
  const isEmptyIdx = (arr: number[]) => arr.length === 4 && arr.every(x => x === -1);

  const changeCourt = async() => {
    setTimerStop();
    const courtUpload = JSON.parse(JSON.stringify(court));

    const donwIdx = court.usersIdx;
    /*比賽idx排除本次下場的*/
    userIdxMatch = userIdxMatch.filter((xx)=>{ return donwIdx.indexOf(xx)==-1; });

    let nextUsersIdx = [-1,-1,-1,-1], nextCourtIdx = -1;
    for (let yy = 0; yy < courts.length; yy++) {
      if(courts[yy].type!=2){ continue; } /*跳過非預備的場地*/
      const idxs = courts[yy].usersIdx;
      if(isEmptyIdx(idxs)){ continue; } /*沒設定人員*/
      /*檢查場上人員是否重複*/
      const set1 = new Set(userIdxMatch);
      if(idxs.filter(item => set1.has(item)).length > 0){
        continue;
      }
      nextUsersIdx = JSON.parse(JSON.stringify(idxs));
      nextCourtIdx = yy;
      break;
    }
    console.log(nextUsersIdx, nextCourtIdx);
  
    /*更新球員下場&上場*/
    const newUserIdxMatch = userIdxMatch.concat(nextUsersIdx).filter((yy)=>(yy!=-1)) /*比賽idx加入本次上場的*/
    if(setUserIdxMatch){ setUserIdxMatch(newUserIdxMatch); }

    /*設定場地球員(上場&更新秒數為0)*/
    if(setCourts){
      setCourts(prev => {
        // 拿出 nextCourtIdx 之前的 type==2 且非 [-1,-1,-1,-1]
        const preserved = prev
          .slice(0, nextCourtIdx)
          .filter(cc => cc.type === 2 && !isEmptyIdx(cc.usersIdx))
          .map(cc => cc.usersIdx);

        // 拿出 nextCourtIdx 之後的 type==2 場次的 idx
        const toShift = prev
          .slice(nextCourtIdx+1)
          .filter(cc => cc.type === 2 && !isEmptyIdx(cc.usersIdx))
          .map(cc => cc.usersIdx);

        // 合併要放回的 idxs，後面不足補 [-1,-1,-1,-1]
        const newIdxList = [...preserved, ...toShift];
        console.log(newIdxList);
        let shiftPointer = 0;
        return prev.map((ee,eeid) => {
          if (ee.type === 2) {
            let newIdx = newIdxList[shiftPointer] || [-1,-1,-1,-1];
            shiftPointer++;
            return { ...ee, usersIdx: newIdx };
          } else {
            return eeid==court_idx ? { ...ee, usersIdx: nextUsersIdx, duration: 0, } : ee;
          }
        });
      });
    }

    const nextEmpty = isEmptyIdx(nextUsersIdx);
    /*更改球員等待&比賽場數*/
    if(setUsers){
      setUsers(prev =>
        prev.map((xx, idx) => {
          let waitNum = xx.waitNum ? xx.waitNum : 0;
          let courtNum = xx.courtNum ? xx.courtNum : 0;
          if(donwIdx.indexOf(idx)!=-1){ /*該球員是下場的人*/
            waitNum = 0;
            courtNum += 1;
          }else if(newUserIdxMatch.indexOf(idx)!=-1){ /*該球員是在比賽的人*/
            waitNum = 0;
          }else if(!nextEmpty){ /*下一場不是空白的*/
            /*其他球員*/
            waitNum += 1;
          }
          return { ...xx, waitNum: waitNum, courtNum: courtNum, }
        })
      );
    }

    /*開始計時*/
    if(!nextEmpty){
      setTimerStart(true);
    }else{
      showMessage('無可用的預備場場次', 'warning');
    }

    /*添加比賽紀錄*/
    if(!isEmptyIdx(courtUpload.usersIdx)){
      console.log(courtUpload);
    }

  }
  const setTimerStop = () => {
    if(setCourts){
      if(timer){
        clearInterval(timer);
        setTimer(null);
      }
      setCourts(prev =>
        prev.map((xx) => (
          xx.id==court.id ? { ...xx, timer: null, } : xx
        ))
      );
    }
  }
  const setTimerStart = (force=false) => {
    if(!force && isEmptyIdx(court.usersIdx)){ /*場上沒人員*/
      showMessage('請先設定球員', 'warning'); return;
    }
    if(setCourts){
      setTimer(setInterval(() => {
        setCourts(prev => prev.map(xx => {
            if (xx.id === court.id) {
              const newDuration = xx.duration + 1;
              return { ...xx, duration: newDuration };
            }
            return xx;
          })
        );
      }, 1000));
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
        {setCourts && <>
          <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <AutorenewIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
              onClick={changeCourt} />
          </Grid>
          <Grid size={4} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {functions.formatSeconds(court.duration)}
          </Grid>
          <Grid size={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {timer && <>
              <PauseIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
                onClick={setTimerStop} />
            </>}
            {!timer && <>
              <PlayArrowIcon color={'inherit'} fontSize={'small'} className='cursor-pointer'
                onClick={()=>{setTimerStart()}} />
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