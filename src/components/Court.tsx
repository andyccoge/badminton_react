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

import UserNameCard, {MyChildRef as UserNameCardMyChildRef} from '../components/UserNameCard';
import {ReservationsType} from '../components/ReservationDrawer';

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
  users:ReservationsType[],
  clickUserName: (refIdx:number) => void;
  vertical?: boolean,
  userIdxMatch: number[];
  userIdxMatchCode: {};
  setUserIdxPrepare?: (items:any) => void;
  setCourts?: (items:any) => void;
  updateUserIdxMatchCode?: (exclude:number[], include:number[], includeCourt:string) => number[];
  setUsers?: (items:any) => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  setUserModel?: (idx:number, item:any) => void;
  setUserDrawer?: (idx:number, item:any) => void;
  setMatchs?: (items:any) => void;
};

function Court(
  { 
    updateBodyBlock, court_idx, courts, users,
    clickUserName, vertical=false,
    userIdxMatch, userIdxMatchCode, setUserIdxPrepare, setCourts, updateUserIdxMatchCode, 
    setUsers, setUserShowUp, setUserLeave,
    setUserModel, setUserDrawer, setMatchs,
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
    updateBodyBlock(true); //顯示遮蓋
    setTimerStop();
    const courtUpload = JSON.parse(JSON.stringify(court));

    const donwUsersIdx = court.usersIdx;
    /*比賽idx排除本次下場的*/
    userIdxMatch = userIdxMatch.filter((xx)=>{ return donwUsersIdx.indexOf(xx)==-1; });

    let nextUsersIdx = [-1,-1,-1,-1], nextCourtIdx = -1;
    for (let yy = 0; yy < courts.length; yy++) {
      if(courts[yy].type!=2){ continue; } /*跳過非預備的場地*/
      const idxs = courts[yy].usersIdx;
      if(isEmptyIdx(idxs)){ continue; } /*沒設定人員*/
      /*檢查場上人員是否重複 或 未報到*/
      const set1 = new Set(userIdxMatch);
      if(idxs.filter(ss => ss!=-1 && (set1.has(ss) || users[ss].show_up==0)).length > 0){
        continue;
      }
      nextUsersIdx = JSON.parse(JSON.stringify(idxs));
      nextCourtIdx = yy;
      break;
    }
    // console.log(nextUsersIdx, nextCourtIdx);
  
    /*更新比賽球員紀錄(添加上場&排除下場)*/
    if(updateUserIdxMatchCode){
      userIdxMatch = updateUserIdxMatchCode(donwUsersIdx, nextUsersIdx, court.code);
    }

    /*設定場地球員(上場&更新秒數為0)*/
    if(setCourts){
      setCourts(prev => {
        // 拿出 nextCourtIdx 之前的 type==2 且非 [-1,-1,-1,-1]
        const preserved = nextCourtIdx>=0 ? prev
          .slice(0, nextCourtIdx)
          .filter(cc => cc.type === 2 && !isEmptyIdx(cc.usersIdx))
          .map(cc => cc.usersIdx) : [];

        // 拿出 nextCourtIdx 之後的 type==2 場次的 idx
        const toShift = prev
          .slice(nextCourtIdx+1)
          .filter(cc => cc.type === 2 && !isEmptyIdx(cc.usersIdx))
          .map(cc => cc.usersIdx);

        // 合併要放回的 idxs，後面不足補 [-1,-1,-1,-1]
        const newIdxList = [...preserved, ...toShift];
        // console.log(newIdxList);
        if(setUserIdxPrepare){ setUserIdxPrepare(newIdxList.flat().filter(cc => cc!=-1)); }

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

    const downEmpty = isEmptyIdx(donwUsersIdx);
    const nextEmpty = isEmptyIdx(nextUsersIdx);
    /*更改球員等待&比賽場數*/
    if(setUsers){
      setUsers(prev =>
        prev.map((xx, idx) => {
          let waitNum = xx.waitNum ? xx.waitNum : 0;
          let courtNum = xx.courtNum ? xx.courtNum : 0;
          if(donwUsersIdx.indexOf(idx)!=-1){ /*該球員是下場的人*/
            waitNum = 0;
            courtNum += 1;
          }else if(userIdxMatch.indexOf(idx)!=-1){ /*該球員是在比賽的人*/
            waitNum = 0;
          }else if(!downEmpty){ /*有人下場*/
            /*其他球員*/
            waitNum += 1;
          }
          return { ...xx, waitNum: waitNum, courtNum: courtNum, }
        })
      );
    }

    /*開始計時*/
    if(!nextEmpty){ /*有人上場*/
      setTimerStart(true);
    }else{
      showMessage('無可用的預備場場次', 'warning');
    }

    /*添加比賽紀錄*/
    if(!isEmptyIdx(courtUpload.usersIdx)){
      // console.log(courtUpload);
      const data = {
        user_id_1: users[courtUpload.usersIdx[0]].user_id,
        user_id_2: users[courtUpload.usersIdx[1]].user_id,
        user_id_3: users[courtUpload.usersIdx[2]].user_id,
        user_id_4: users[courtUpload.usersIdx[3]].user_id,
        play_date_id: courtUpload.play_date_id,
        court_id: courtUpload.id,
        duration: courtUpload.duration,
        point_12: 0,
        point_34: 0,
      }
      try {
        const result = await functions.fetchData('POST', 'matchs', data);
        if(result.msg){
          showMessage(result.msg, 'error');
        }
        data['id'] = Math.round(Math.random() * 100000);
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('發生錯誤', 'error');
      }
      if(setMatchs){setMatchs(prev => prev.push(data));}
    }
    updateBodyBlock(false); //隱藏遮蓋
  }
  const setTimerStop = () => {
    if(setCourts){
      if(timer){
        clearInterval(timer);
        setTimer(null);
      }
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
        overflow:'unset', 
      }}>
        <CardContent style={{padding:0,}}>
          <Grid container spacing={1} padding={vertical?'5px 10px':'10px 0'}
                alignItems={'center'} justifyContent={'center'}>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1} alignItems={'center'} justifyContent={'space-around'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[0]}
                              user={users[court.usersIdx[0]]}
                              vertical={vertical}
                              userIdxMatch={court.type==1 ? [] : userIdxMatch}
                              matchCourtCode={court.type==1 ? '' : userIdxMatchCode[court.usersIdx[0]]??''}                              
                              onClick={()=>{clickUserName(0)}}
                              setUserShowUp={setUserShowUp}
                              setUserLeave={setUserLeave}
                              setUserModel={setUserModel}
                              setUserDrawer={setUserDrawer}
                              ref={UserNameCardRef1}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[1]}
                              user={users[court.usersIdx[1]]}
                              vertical={vertical}
                              userIdxMatch={court.type==1 ? [] : userIdxMatch}
                              matchCourtCode={court.type==1 ? '' : userIdxMatchCode[court.usersIdx[1]]??''}                              
                              onClick={()=>{clickUserName(1)}}
                              setUserShowUp={setUserShowUp}
                              setUserLeave={setUserLeave}
                              setUserModel={setUserModel}
                              setUserDrawer={setUserDrawer}
                              ref={UserNameCardRef2}
                ></UserNameCard>
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 2, md:1}} 
                  display={'flex'} justifyContent={'center'}>
              <Stack direction={vertical?'row':'column'} display={'flex'} alignItems={'center'} justifyContent={'space-around'}>
                <Typography sx={{pr:vertical?'0.5rem':0,}}>
                  {court && court.code}
                </Typography>
                <EditSquareIcon />
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1} alignItems={'center'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[2]}
                              user={users[court.usersIdx[2]]}
                              vertical={vertical}
                              userIdxMatch={court.type==1 ? [] : userIdxMatch}
                              matchCourtCode={court.type==1 ? '' : userIdxMatchCode[court.usersIdx[2]]??''}                              
                              onClick={()=>{clickUserName(2)}}
                              setUserShowUp={setUserShowUp}
                              setUserLeave={setUserLeave}
                              setUserModel={setUserModel}
                              setUserDrawer={setUserDrawer}
                              ref={UserNameCardRef3}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={court.usersIdx[3]}
                              user={users[court.usersIdx[3]]}
                              vertical={vertical}
                              userIdxMatch={court.type==1 ? [] : userIdxMatch}
                              matchCourtCode={court.type==1 ? '' : userIdxMatchCode[court.usersIdx[3]]??''}                              
                              onClick={()=>{clickUserName(3)}}
                              setUserShowUp={setUserShowUp}
                              setUserLeave={setUserLeave}
                              setUserModel={setUserModel}
                              setUserDrawer={setUserDrawer}
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