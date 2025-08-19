import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {Grid, Divider, Box, Button, Stack} from '@mui/material'
import {Card, CardContent} from '@mui/material';
import {Skeleton} from '@mui/material';

import BottomNavigation, {MyChildRef as BottomNavigationMyChildRef} from '../components/BottomNavigation';
import Court, {MyChildRef as CourtMyChildRef} from '../components/Court';
import {userType} from '../components/UserNameCard';

const vertical=true; /* true false */

const initCourt = (court:any) => {
  court.duration = 0; /*持續時間*/
  court.started = 0;  /*進行比賽*/
  /*場上人員index(對應主資料)*/
  const usersIdxList:number[] = [-1,-1,-1,-1];
  court.usersIdx = usersIdxList;
  /*場上人員資料*/
  const usersList:Array<userType | null> = [null,null,null,null];
  court.users = usersList;
  return court;
}
const initCourtUser = (user:any) => {
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
  const [courtsMatch, setCourtsMatch] = React.useState<any[]>([]);
  const [courtsPrepare, setCourtsPrepare] = React.useState<any[]>([]);
  const [matchs, setMatchs] = React.useState<any[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [user_map, setUserMap] = React.useState<any>({});
  
  const [selectedCourtType, setSelectedCourtType] = React.useState<number>(0);
  const [selectedCourtIdx, setSelectedCourtIdx] = React.useState<number>(-1);
  const [selectedNameIdx, setSelectedNameIdx] = React.useState<number>(-1);

  const setPlayCourtsMatch = (courts:any[]) => {
    setCourtsMatch(courts.map((item)=>{ return initCourt(item); }));
  }
  const setPlayCourtsPrepare = (courts:any[]) => {
    setCourtsPrepare(courts.map((item)=>{ return initCourt(item); }));
  }

  const setPlayUsers = (users:any[]) => {
    users = users.map((item)=>{ return initCourtUser(item); })
    setReservations(users);
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

        setCourts(result.courts);
        setPlayCourtsMatch(result.courts_match);
        setPlayCourtsPrepare(result.courts_prepare);
        setUserMap(result.user_map);
        setMatchs(result.matchs);
        setCards([result.play_date]);
        setPlayUsers(result.reservations);
        // TableUsersRef.current?.showRows(result.reservations);
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('取得打球日完整設定資料發生錯誤', 'error');
      }
      setInitFinished(true);
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const CourtMatchRefs = React.useRef<Array<React.RefObject<CourtMyChildRef | null>>>([]);
  const CourtPrepareRefs = React.useRef<Array<React.RefObject<CourtMyChildRef | null>>>([]);
  const handleCourtRefs = (type: number, index: number) => (el: CourtMyChildRef | null) => {
    const tempRef = type==1 ? CourtMatchRefs : CourtPrepareRefs;
    if (el) {
      tempRef.current[index] = { current: el };
    } else {
      tempRef.current[index] = { current: null };
    }
  };

  const cleanSeletedCourtName = async() => {
    await setSelectedCourtType(0);
    await setSelectedCourtIdx(-1);
    await setSelectedNameIdx(-1);
    CourtMatchRefs?.current.forEach((ref,idx) => {
      const names = ref?.current?.getUserNameCards();
      names?.forEach(async(name) => {
        await name.current?.setSelectedStatus(false);
      });
    });
    CourtPrepareRefs?.current.forEach((ref,idx) => {
      const names = ref?.current?.getUserNameCards();
      names?.forEach(async(name) => {
        await name.current?.setSelectedStatus(false);
      });
    });
  }
  const clickCourtUserName = (type:number, courtIdx:number) => {
    const tempRefs = type==1 ? CourtMatchRefs : CourtPrepareRefs;
    const clickUserName = async (refIdx) => {
      const tempRef = tempRefs?.current[courtIdx];
      const NameRefs = tempRef?.current?.getUserNameCards();
      const NameRef = NameRefs?.[refIdx].current;
      const oriStatus = NameRef?.getSelectedStatus();
      await cleanSeletedCourtName();
      if(oriStatus==false){
        NameRef?.setSelectedStatus(true)
        setSelectedCourtType(type);
        setSelectedCourtIdx(courtIdx);
        setSelectedNameIdx(refIdx);
        BottomNavigationRef?.current?.setUserPanelDrawerOpen(true);
      }
    }
    return clickUserName
  }

  const BottomNavigationRef = React.useRef<BottomNavigationMyChildRef>(null);
  const doSelectUser = async(userIdx:number) => {
    if(selectedCourtType<0 || selectedCourtIdx==-1 || selectedNameIdx==-1){ return; }
    const tempCourts = selectedCourtType==1 ? courtsMatch : courtsPrepare;
    const tempCourtsRefs = selectedCourtType==1 ? CourtMatchRefs : CourtPrepareRefs;
    const usersIdx = tempCourts[selectedCourtIdx].usersIdx;
    usersIdx[selectedNameIdx] = usersIdx;
    const users = tempCourts[selectedCourtIdx].users;
    users[selectedNameIdx] = JSON.parse(JSON.stringify(reservations[userIdx]));
    if(selectedCourtType==1){
      setCourtsMatch(prev =>
        prev.map((court,idx) =>
          idx === selectedCourtIdx
            ? { ...court, usersIdx: usersIdx, users: users }
            : court
        )
      );
    }else{
      setCourtsPrepare(prev =>
        prev.map((court,idx) =>
          idx === selectedCourtIdx
            ? { ...court, usersIdx: usersIdx, users: users }
            : court
        )
      );
    }
    
    const nextIdx = usersIdx.indexOf(-1);
    const nameRefs = tempCourtsRefs?.current[selectedCourtIdx].current?.getUserNameCards();
    if(nameRefs){
      nameRefs[selectedNameIdx].current?.setSelectedStatus(false);
      if(nextIdx!=-1){ /*場地還有空位代設定球員*/
          nameRefs[nextIdx].current?.setSelectedStatus(true);
          setSelectedNameIdx(nextIdx);
      }else{
        await setSelectedCourtType(0);
        await setSelectedCourtIdx(-1);
        await setSelectedNameIdx(-1);
        BottomNavigationRef?.current?.setUserPanelDrawerOpen(false);
      }
    }
  }

  return (   
    <>
      {/* <Button onClick={()=>{
        console.log(CourtMatchRefs);
        console.log(CourtPrepareRefs);
        console.log(selectedCourtType);
        console.log(selectedCourtIdx);
        console.log(selectedNameIdx);
      }}>CourtRefs</Button> */}

      <Box sx={{pb:'0.5rem'}}></Box>
      {/* 比賽場 */}
      <Grid container spacing={1}>
        {!initFinished && [0,0].map((_, temp_idx) => (<TempCourt key={'tempcourt1-'+temp_idx}/>))}
        {courtsMatch.map((court, court_idx) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg:2, xl:2 }} key={'court-'+court_idx}>
            <Court updateBodyBlock={updateBodyBlock}
                  court={court}
                  court_idx={court_idx}
                  clickUserName={clickCourtUserName(1, court_idx)}
                  user_1_idx={court.usersIdx.length>0?court.usersIdx[0]:-1}
                  user_1={court.users.length>0?court.users[0]:null}
                  user_2_idx={court.usersIdx.length>1?court.usersIdx[1]:-1}
                  user_2={court.users.length>1?court.users[1]:null}
                  user_3_idx={court.usersIdx.length>2?court.usersIdx[2]:-1}
                  user_3={court.users.length>2?court.users[2]:null}
                  user_4_idx={court.usersIdx.length>3?court.usersIdx[3]:-1}
                  user_4={court.users.length>3?court.users[3]:null}
                  vertical={vertical}
                  ref={handleCourtRefs(1, court_idx)}
            />
          </Grid>
        ))}
      </Grid>
      <Divider sx={{mt:'0.5rem', mb:'0.5rem'}}/>
      
      {/* 預備場 */}
      <Grid container spacing={1}>
        {!initFinished && [0,0,0,0].map((_, temp_idx) => (<TempCourt key={'tempcourt2-'+temp_idx}/>))}
        {courtsPrepare.map((court, court_idx) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg:2, xl:2 }} key={'court-'+court_idx}>
            <Court updateBodyBlock={updateBodyBlock}
                  court={court}
                  court_idx={court_idx}
                  clickUserName={clickCourtUserName(2, court_idx)}
                  user_1_idx={court.usersIdx.length>0?court.usersIdx[0]:-1}
                  user_1={court.users.length>0?court.users[0]:null}
                  user_2_idx={court.usersIdx.length>1?court.usersIdx[1]:-1}
                  user_2={court.users.length>1?court.users[1]:null}
                  user_3_idx={court.usersIdx.length>2?court.usersIdx[2]:-1}
                  user_3={court.users.length>2?court.users[2]:null}
                  user_4_idx={court.usersIdx.length>3?court.usersIdx[3]:-1}
                  user_4={court.users.length>3?court.users[3]:null}
                  vertical={vertical}
                  ref={handleCourtRefs(2, court_idx)}
            />
          </Grid>
        ))}
      </Grid>

      <div className="invisible pt-2">
        <BottomNavigation updateBodyBlock={updateBodyBlock}/>
      </div>
      <footer id="footer_btn">
        <BottomNavigation updateBodyBlock={updateBodyBlock}
          users={reservations}
          cleanSeletedCourtName={cleanSeletedCourtName}
          doSelectUser={doSelectUser}
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