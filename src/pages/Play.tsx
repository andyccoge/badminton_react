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
import ReservationDrawer, {MyChildRef as ReservationDrawerMyChildRef, PlayReservationsType} from '../components/ReservationDrawer';
import { Data as CourtData, CourtPlayData } from '../components/TableCourts.tsx';
import { Data as MatchData } from '../components/TableMatchs.tsx';

const vertical=true; /* true false */

const initCourt = (court:CourtData):CourtPlayData => {
  return {
    ...court,
    duration: 0, /*持續時間*/
    usersIdx: [-1, -1, -1, -1], /*場上人員index(對應主資料)*/
  };
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

  const [initFinished, setInitFinished] = React.useState(false);
  const [courts, setCourts] = React.useState<CourtPlayData[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<PlayReservationsType[]>([]);

  /*在比賽場中的球員idx(有紀錄表示在比賽中)*/
  const [userIdxMatch, setUserIdxMatch] = React.useState<number[]>([]);
  /*在比賽場中的球員idx對應所在場地編號(有在比賽中就應有紀錄)*/
  const [userIdxMatchCode, setUserIdxMatchCode] = React.useState<any>({});
  /*在預備場中的球員idx(有紀錄表示在預備中)*/
  const [userIdxPrepare, setUserIdxPrepare] = React.useState<number[]>([]);
  const [selectedCourtIdx, setSelectedCourtIdx] = React.useState<number>(-1);
  const [selectedNameIdx, setSelectedNameIdx] = React.useState<number>(-1);

  const setPlayUsers = (users:any[]) => {
    users = users.map((item)=>{ 
      let donthasUser = 1;
      for (let xx = 0; xx < reservations.length; xx++) {
        if(reservations[xx].user_id == item.user_id){
          item = {...reservations[xx], ...item};
          donthasUser = 0; break;
        }
      }
      if(donthasUser){ initCourtUser(item); }
      return item;
    });
    
    setReservations(users);
  }
  const setPlayCourts = (courts:any[]) => {
    setCourts(courts.map((item)=>{ return initCourt(item); }));
  }
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
  const updateUserIdxPrepare = (excludeCourtIndex:number, include:number[]=[]):number[][] => {
    // 拿出 要排除場地(excludeCourtIndex) 之前的 type==2 的場地的設定球員idx
    const preserved = excludeCourtIndex>=0 ? courts
          .slice(0, excludeCourtIndex)
          .filter(cc => cc.type === 2)
          .map(cc => cc.usersIdx) : [];
    // 拿出 要排除場地(excludeCourtIndex) 之後的 type==2 的場地的設定球員idx
    const toShift = courts
      .slice(excludeCourtIndex+1)
      .filter(cc => cc.type === 2 && !functions.isEmptyIdx(cc.usersIdx))
      .map(cc => cc.usersIdx);
    // 合併要放回的 idxs
    const newCourtsusersIdx = [...preserved, ...toShift]; /*依照場次紀錄各個場的安排球員們*/
    /*排除-1、添加新預備球員，並設定新預備球員紀錄*/
    setUserIdxPrepare(newCourtsusersIdx.flat().filter(cc => cc!=-1).concat(include));
    return newCourtsusersIdx;
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
        BottomNavigationRef.current?.setCourts(result.courts);
        BottomNavigationRef.current?.setPlayMatchs(result);
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
      await setPlayUsers(result.data);
    } catch (error) {
      showMessage('取得報名紀錄資料發生錯誤', 'error');
    }
    updateBodyBlock(false);
  }

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
      updateUserIdxPrepare(courtIdx, usersIdx);
    }
    return true;
  }
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

  const CourtRefs = React.useRef<Array<React.RefObject<CourtMyChildRef | null>>>([]);
  const handleCourtRefs = (index: number) => (el: CourtMyChildRef | null) => {
    if (el) {
      CourtRefs.current[index] = { current: el };
    } else {
      CourtRefs.current[index] = { current: null };
    }
  };
  const clickCourt = (courtIdx:number) => {
    BottomNavigationRef.current?.setCourtsModel(courtIdx, courts[courtIdx]);
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
        BottomNavigationRef.current?.setUserPanelDrawerOpen(true);
      }
    }
    return clickUserName
  }
  const setUserShowUp = async(idx:number) => { await setUserShowUpOrLeave(idx, 1); }
  const setUserLeave = async(idx:number) => { await setUserShowUpOrLeave(idx, 0); }
  const setUserModel = (idx, item) => {
    UserModelRef.current?.setModel(idx, item, 'user_id');
  }
  const setUserDrawer = (idx, item) => {
    ReservationDrawerRef.current?.setModel(idx, item);
  }
  const addMatchs = (newMatch:MatchData) => {
    const matchs = BottomNavigationRef.current?.getMatchs() ?? [];
    matchs.push(newMatch);
    BottomNavigationRef.current?.showMatchs(matchs);
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
          BottomNavigationRef.current?.setUserPanelDrawerOpen(false);
        }
      }
    }
  }
  const renewCourts = (items:CourtData[]) => {
    const items2:CourtPlayData[] = items.map((item, idx)=>{
      return idx>=courts.length ? initCourt(item) : {...courts[idx], ...item};
    });
    setCourts(items2);
  };
  const renewCourt = (idx:number, item:CourtData) => {
    if(courts[idx].type==1 && item.type==2){ /*從比賽轉預備*/
      updateUserIdxMatchCode(courts[idx].usersIdx); /*從比賽場中排除*/
      updateUserIdxPrepare(-1, courts[idx].usersIdx); /*添加至預備場中*/
    }else if(courts[idx].type==2 && item.type==1){ /*從預備轉比賽*/
      updateUserIdxMatchCode([], courts[idx].usersIdx, item.code); /*添加至比賽場中*/
      updateUserIdxPrepare(idx); /*從預備場中排除*/
    }
    courts[idx] = {...courts[idx], ...item}
    setCourts(courts);
  }
  const checkCourtsEditable = (idx:number, item:CourtData):string => {
    if(courts[idx].type==2 && item.type==1){ /*從預備轉比賽*/
      const setB = new Set(courts[idx].usersIdx);
      const hasIntersection = userIdxMatch.some(num => setB.has(num));
      if(hasIntersection){
        return '有球員已在比賽場上，無法修改';
      }
    }
    return '';
  }

  const UserModelRef = React.useRef<UserModelMyChildRef>(null);
  const reGetListUsers = async () => {
    await goSearchReservations();
  }
  const renewListUsers = async (idx, item)=>{
    reservations[idx] = {...reservations[idx], ...item};
    setReservations(reservations);
  }

  const ReservationDrawerRef = React.useRef<ReservationDrawerMyChildRef>(null);

  return (   
    <>
      {/* <Button onClick={()=>{
        console.log(userIdxMatch, userIdxPrepare, userIdxMatchCode,reservations)
        console.log(courts)
      }}>test</Button> */}
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
                      clickCourt={clickCourt}
                      reservations={reservations}
                      clickUserName={clickCourtUserName(court_idx)}
                      vertical={vertical}
                      userIdxMatch={userIdxMatch}
                      userIdxMatchCode={userIdxMatchCode}
                      setCourts={setCourts}
                      updateUserIdxMatchCode={updateUserIdxMatchCode}
                      updateUserIdxPrepare={updateUserIdxPrepare}
                      setReservations={setReservations}
                      setUserShowUp={setUserShowUp}
                      setUserLeave={setUserLeave}
                      setUserModel={setUserModel}
                      setUserDrawer={setUserDrawer}
                      addMatchs={addMatchs}
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
                      clickCourt={clickCourt}
                      reservations={reservations}
                      clickUserName={clickCourtUserName(court_idx)}
                      vertical={vertical}
                      userIdxMatch={userIdxMatch}
                      userIdxMatchCode={userIdxMatchCode}
                      updateUserIdxPrepare={updateUserIdxPrepare}
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
          renewReservations={goSearchReservations}
          cleanSeletedCourtName={cleanSeletedCourtName}
          doSelectUser={doSelectUser}
          setUserShowUp={setUserShowUp}
          setUserLeave={setUserLeave}
          userIdxMatch={userIdxMatch}
          userIdxMatchCode={userIdxMatchCode}
          userIdxPrepare={userIdxPrepare}
          setUserModel={setUserModel}
          setUserDrawer={setUserDrawer}
          renewCourts={renewCourts}
          renewCourt={renewCourt}
          checkCourtsEditable={checkCourtsEditable}
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