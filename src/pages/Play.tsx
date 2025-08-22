import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {Grid, Divider, Box, Button, Stack} from '@mui/material'
import {Card, CardContent} from '@mui/material';
import {Skeleton} from '@mui/material';

import BottomNavigation, {MyChildRef as BottomNavigationMyChildRef} from '../components/BottomNavigation';
import Court, {MyChildRef as CourtMyChildRef} from '../components/Court';
import UserModel, {MyChildRef as UserModelMyChildRef} from '../components/Model/UserModel';
import ReservationDrawer, {MyChildRef as ReservationDrawerMyChildRef} from '../components/ReservationDrawer';
import { Data as MatchData } from '../components/TableMatchs.tsx';

const vertical=true; /* true false */

const initCourt = (court:any) => {
  court.duration = 0; /*持續時間*/
  /*場上人員index(對應主資料)*/
  const usersIdxList:number[] = [-1,-1,-1,-1];
  court.usersIdx = usersIdxList;
  return court;
}
const initCourtUser = (user:any) => {
  user.waitNum = 0;
  user.courtNum = 0;
  user.groupNumber = -1;
  return user;
}

function Play({updateBodyBlock, showConfirmModelStatus}) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  // 預設篩選條件(限本打球日)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const play_date_id:string | null = searchParams.get('id') || '0';
  // defaulUsertWhere['play_date_id'] = play_date_id;
  // defaulCourtWhere['play_date_id'] = play_date_id;
  // defaulMatchWhere['play_date_id'] = play_date_id;

  const [initFinished, setInitFinished] = React.useState(false);
  const [courts, setCourts] = React.useState<any[]>([]);
  const [matchs, setMatchs] = React.useState<any[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [user_map, setUserMap] = React.useState<any>({});

  /*在比賽場中的球員idx(有紀錄表示在場上)*/
  const [userIdxMatch, setUserIdxMatch] = React.useState<number[]>([]);
  const [userIdxPrepare, setUserIdxPrepare] = React.useState<number[]>([]);
  const [userIdxMatchCode, setUserIdxMatchCode] = React.useState<any>({});
  const updateUserIdxMatchCode = (exclude:number[]=[], include:number[]=[], includeCourt:string='') => {
    exclude = exclude.filter((yy)=>(yy!=-1));
    include = include.filter((yy)=>(yy!=-1));
    // console.log(exclude, include);
    setUserIdxMatchCode(prev => {
      // 先過濾掉
      let newIdxCode = Object.fromEntries(
        Object.entries(prev).filter(([k]) => !exclude.includes(Number(k)))
      );
      // 加入（覆蓋）
      include.forEach(k => { newIdxCode[k] = includeCourt; });
      return newIdxCode;
    });

    const newUserIdxMatch = userIdxMatch
      .filter((xx)=>{ return exclude.indexOf(xx)==-1; })
      .concat(include);
    setUserIdxMatch(newUserIdxMatch);
    return newUserIdxMatch;
  };

  const [selectedCourtIdx, setSelectedCourtIdx] = React.useState<number>(-1);
  const [selectedNameIdx, setSelectedNameIdx] = React.useState<number>(-1);

  const setPlayUsers = (users:any[], Oris:any[]=[]) => {
    users = users.map((item)=>{ return initCourtUser(item); })
    setReservations(users);
  }
  const setPlayCourts = (courts:any[]) => {
    setCourts(courts.map((item)=>{ return initCourt(item); }));
  }
  const setPlayMatchs = (result:{matchs:MatchData[]; user_map:any}) => {
    setMatchs(result.matchs);
    setUserMap(result.user_map);
  }

  React.useEffect(() => {
    (async () => {
      updateBodyBlock(true); //顯示遮蓋
      setInitFinished(false);
      try {
        let result = await functions.fetchData('GET', 'play_date_data', null, {id:play_date_id});
        // console.log(result);
        if(!result.play_date){
          showMessage('無此打球日，頁面即將跳轉', 'error');
          navigate('/', { replace: true });
          return;
        }

        setCards([result.play_date]);
        setPlayUsers(result.reservations);
        setPlayCourts(result.courts);
        setPlayMatchs(result);
        // TableUsersRef.current?.showRows(result.reservations);
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('取得打球日完整設定資料發生錯誤', 'error');
      }
      setInitFinished(true);
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount
  const goSearchReservations = async (where:any={}) =>{
    updateBodyBlock(true);
    where.play_date_id = play_date_id;
    try {
      let result = await functions.fetchData('GET', 'reservations', null, where);
      setPlayUsers(result.data, reservations);
    } catch (error) {
      showMessage('取得報名紀錄資料發生錯誤', 'error');
    }
    updateBodyBlock(false);
  }

  const CourtRefs = React.useRef<Array<React.RefObject<CourtMyChildRef | null>>>([]);
  const handleCourtRefs = (index: number) => (el: CourtMyChildRef | null) => {
    if (el) {
      CourtRefs.current[index] = { current: el };
    } else {
      CourtRefs.current[index] = { current: null };
    }
  };

  const cleanSeletedCourtName = () => {
    const selectedCourt = CourtRefs?.current[selectedCourtIdx];
    if(!selectedCourt){ return; }
    const nameRefs = selectedCourt.current?.getUserNameCards();
    if(nameRefs){
      nameRefs[selectedNameIdx].current?.setSelectedStatus(false);
    }
    setSelectedCourtIdx(-1);
    setSelectedNameIdx(-1);
  }
  const clickCourtUserName = (courtIdx:number) => {
    const clickUserName = (refIdx) => {
      const tempRef = CourtRefs?.current[courtIdx];
      const NameRefs = tempRef?.current?.getUserNameCards();
      const NameRef = NameRefs?.[refIdx].current;
      const oriStatus = NameRef?.getSelectedStatus();
      cleanSeletedCourtName();
      if(oriStatus==false){
        NameRef?.setSelectedStatus(true);
        setSelectedCourtIdx(courtIdx);
        setSelectedNameIdx(refIdx);
        // 捲動到該場地
        tempRef.current?.scrollToSelf();
        BottomNavigationRef?.current?.setUserPanelDrawerOpen(true);
      }
    }
    return clickUserName
  }

  const BottomNavigationRef = React.useRef<BottomNavigationMyChildRef>(null);
  const doSelectUser = async(userIdx:number) => {
    let result = setCourtUser(selectedCourtIdx, selectedNameIdx, userIdx);
    if(result){
      const usersIdx = courts[selectedCourtIdx].usersIdx;
      const nextIdx = usersIdx.indexOf(-1);
      const nameRefs = CourtRefs?.current[selectedCourtIdx].current?.getUserNameCards();
      if(nameRefs){
        nameRefs[selectedNameIdx].current?.setSelectedStatus(false);
        if(nextIdx!=-1){ /*場地還有空位代設定球員*/
            nameRefs[nextIdx].current?.setSelectedStatus(true);
            // 捲動到該場地
            CourtRefs?.current[selectedCourtIdx].current?.scrollToSelf();
            setSelectedNameIdx(nextIdx);
        }else{
          await setSelectedCourtIdx(-1);
          await setSelectedNameIdx(-1);
          BottomNavigationRef?.current?.setUserPanelDrawerOpen(false);
        }
      }
    }
  }

  const setCourtUser = (courtIdx:number, nameIdx:number, userIdx:number):boolean => {
    if(courtIdx<0 || nameIdx<0){ 
      showMessage('未設定上場位置', 'warning'); return false;
    }
    if(courtIdx>=courts.length){
      showMessage('設定場地有誤', 'warning'); return false;
    }
    const usersIdx = courts[courtIdx].usersIdx;
    if(nameIdx>=usersIdx.length){
      showMessage('設定位置有誤', 'warning'); return false;
    }

    let userData:any = null;
    if(userIdx==-1){ /*下場*/
      userData = null;
    }else{ /*上場*/
      userData = reservations[userIdx];
      if(userData.show_up==0){
        showMessage('此球員不在場', 'warning'); return false;
      }
      // if(userData.leave==1){
      //   showMessage('此球員已離場', 'warning'); return false;
      // }
      if(courts[courtIdx].type==1 && userIdxMatch.indexOf(userIdx)!=-1){
        showMessage('此球員已在比賽場上', 'warning'); return false;
      }
      if(usersIdx.indexOf(userIdx)!=-1){
        showMessage('已在場上', 'warning'); return false;
      }
    }
    const oriUserIdx = usersIdx[nameIdx];
    usersIdx[nameIdx] = userIdx;
    setCourts(prev =>
      prev.map((court,idx) =>
        idx === courtIdx
          ? { ...court, usersIdx: usersIdx,}
          : court
      )
    );
    if(courts[courtIdx].type==1){
      updateUserIdxMatchCode([oriUserIdx], [userIdx], courts[courtIdx].code);
    }else{
      /*排除原本在準備的idx*/
      const tempUserIdxs = userIdxPrepare.filter(item => item !== oriUserIdx);
      if(userIdx!=-1){
        /*添加新上場的idx*/
        tempUserIdxs.push(userIdx);
      }
      setUserIdxPrepare(tempUserIdxs);
    }
    return true;
  }

  const setUserShowUp = async(idx:number) => { await setUserShowUpOrLeave(idx, 1); }
  const setUserLeave = async(idx:number) => { await setUserShowUpOrLeave(idx, 0); }
  const setUserShowUpOrLeave = async(idx:number, status:number) => {
    updateBodyBlock(true); //顯示遮蓋
    setReservations(prev =>
      prev.map((xx, xidx) => (
        (idx==xidx || idx==-1) ? { ...xx, show_up: status, } : xx
      ))
    );
    try {
      const where = { play_date_id:play_date_id };
      if(idx>=0){ where['id'] = reservations[idx].id; }
      // console.log(where)
      const result = await functions.fetchData('PUT', 'reservations', {show_up: status}, where);
      if(result.msg){
        showMessage(result.msg, 'error');
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('發生錯誤', 'error');
    }
    updateBodyBlock(false); //隱藏遮蓋
  }

  const UserModelRef = React.useRef<UserModelMyChildRef>(null);
  const reGetListUsers = async () => {
    await goSearchReservations();
  }
  const renewListUsers = async (idx, item)=>{
    reservations[idx] = {...reservations[idx], ...item};
    setReservations(reservations);
  }
  const setUserModel = (idx, item) => {
    UserModelRef.current?.setModel(idx, item, 'user_id');
  }

  const ReservationDrawerRef = React.useRef<ReservationDrawerMyChildRef>(null);
  const setUserDrawer = (idx, item) => {
    ReservationDrawerRef.current?.setModel(idx, item);
  }

  return (   
    <>
      <Button onClick={()=>{console.log(userIdxMatch, userIdxPrepare, userIdxMatchCode,reservations)}}>test</Button>
      <Box sx={{pb:'0.5rem'}}></Box>
      {/* 比賽場 */}
      <Grid container spacing={1}>
        {!initFinished && [0,0].map((_, temp_idx) => (<TempCourt key={'tempcourt1-'+temp_idx}/>))}
        {courts.map((court, court_idx) => (
          <React.Fragment key={'court-'+court_idx}>
            {court.type==1 && 
              <Grid size={{ xs: 6, sm: 4, md: 3, lg:2, xl:2 }}>
                <Court updateBodyBlock={updateBodyBlock}
                      court_idx={court_idx}
                      courts={courts}
                      users={reservations}
                      clickUserName={clickCourtUserName(court_idx)}
                      vertical={vertical}
                      userIdxMatch={userIdxMatch}
                      setUserIdxPrepare={setUserIdxPrepare}
                      userIdxMatchCode={userIdxMatchCode}
                      setCourts={setCourts}
                      updateUserIdxMatchCode={updateUserIdxMatchCode}
                      setUsers={setReservations}
                      setUserShowUp={setUserShowUp}
                      setUserLeave={setUserLeave}
                      setUserModel={setUserModel}
                      setUserDrawer={setUserDrawer}
                      setMatchs={setMatchs}
                      ref={handleCourtRefs(court_idx)}
                />
              </Grid>
            }
          </React.Fragment>
        ))}
      </Grid>
      <Divider sx={{mt:'0.5rem', mb:'0.5rem'}}/>
      
      {/* 預備場 */}
      <Grid container spacing={1}>
        {!initFinished && [0,0,0,0].map((_, temp_idx) => (<TempCourt key={'tempcourt2-'+temp_idx}/>))}
        {courts.map((court, court_idx) => (
          <React.Fragment key={'court-'+court_idx}>
            {court.type==2 && 
              <Grid size={{ xs: 6, sm: 4, md: 3, lg:2, xl:2 }}>
                <Court updateBodyBlock={updateBodyBlock}
                      court_idx={court_idx}
                      courts={courts}
                      users={reservations}
                      clickUserName={clickCourtUserName(court_idx)}
                      vertical={vertical}
                      userIdxMatch={userIdxMatch}
                      setUserIdxPrepare={setUserIdxPrepare}
                      userIdxMatchCode={userIdxMatchCode}
                      setUserShowUp={setUserShowUp}
                      setUserLeave={setUserLeave}
                      setUserModel={setUserModel}
                      setUserDrawer={setUserDrawer}
                      ref={handleCourtRefs(court_idx)}
                />
              </Grid>
            }
          </React.Fragment>
        ))}
      </Grid>

      {/* 預留空白給人員面板 */}
      <Box height={'50vh'}></Box>

      <UserModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetListUsers}
                  renewList={renewListUsers}
                  ref={UserModelRef} />
      <ReservationDrawer updateBodyBlock={updateBodyBlock}
                  reservations={reservations}
                  setReservations={setReservations}
                  setUserModel={setUserModel}
                  ref={ReservationDrawerRef} />

      <div className="invisible pt-2">
        <BottomNavigation updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}/>
      </div>
      <footer id="footer_btn">
        <BottomNavigation updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
          playDateId={play_date_id}
          users={reservations}
          matchs={matchs}
          user_map={user_map}
          setPlayMatchs={setPlayMatchs}
          cleanSeletedCourtName={cleanSeletedCourtName}
          doSelectUser={doSelectUser}
          setUserShowUp={setUserShowUp}
          setUserLeave={setUserLeave}
          userIdxMatch={userIdxMatch}
          userIdxMatchCode={userIdxMatchCode}
          userIdxPrepare={userIdxPrepare}
          setUserModel={setUserModel}
          setUserDrawer={setUserDrawer}
          ref={BottomNavigationRef}
        />
      </footer>
    </>
  )
}
export default Play

function TempCourt(){
  return (
    <Grid size={{ xs: 6, sm: 4, md: 3, lg:2, xl:2 }}>
      <Card>
        <CardContent style={{padding:5}}>
          <Stack direction={'row'} spacing={1} justifyContent={'center'}>
            <Skeleton animation="wave" variant="rounded" width={100} height={64}/>
            <Skeleton animation="wave" variant="rounded" width={100} height={64}/>
          </Stack>
          <Stack direction={'row'} spacing={1} justifyContent={'center'} m={'8px'}>
            <Skeleton animation="wave" variant="rounded" width={100} height={40}/>
          </Stack>
          <Stack direction={'row'} spacing={1} justifyContent={'center'}>
            <Skeleton animation="wave" variant="rounded" width={100} height={64}/>
            <Skeleton animation="wave" variant="rounded" width={100} height={64}/>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}