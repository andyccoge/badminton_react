import * as functions from '../functions.tsx';
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {Box, Grid, Skeleton, Divider} from '@mui/material';
import {Card,CardContent} from '@mui/material';
import {Button, Typography, TextareaAutosize} from '@mui/material';

import {TabContext, TabList, TabPanel} from '@mui/lab';
import {Tabs, Tab} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';

import AdminNav from '../components/AdminNav.tsx'
import TableUsers, {
  MyChildRef as TableUsersMyChildRef, empty_searchForm as emptyUserSearchForm
} from '../components/TableUsers.tsx';

function Playdate({updateBodyBlock}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const play_date_id = searchParams.get('id');

  const [initFinished, setInitFinished] = React.useState(false);
  const [courtType, setCourtType] = React.useState<any[]>([]);
  const [courts, setCourts] = React.useState<any[]>([]);
  const [matchs, setMatchs] = React.useState<any[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [user_map, setUserMap] = React.useState<any>({});

  const [userSearchForm, setuserSearchForm] = React.useState(JSON.parse(JSON.stringify(emptyUserSearchForm)));
  const TableUsersRef = React.useRef<TableUsersMyChildRef>(null);

  const [tabValue, setTabValue] = React.useState('tab1');
  const handleTabChange = (event: React.SyntheticEvent, newTabValue: string) => {
    setTabValue(newTabValue);
  };

  React.useEffect(() => {
    (async () => {
      updateBodyBlock(true); //顯示遮蓋
      try {
        await getAllData(Number(play_date_id));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const getAllData = async (play_date_id:number=0):Promise<any> => {
    setInitFinished(false);
    let result = await functions.fetchData('GET', 'play_date_data', null, {id:play_date_id});
    console.log(result);
    if(!result.play_date){ 
      navigate('/', { replace: true });
      return {};
    }
    setCourtType(result.court_type);
    setCourts(result.courts);
    setMatchs(result.matchs);
    setCards([result.play_date]);
    setReservations(result.reservations);
    setUserMap(result.user_map);
    setInitFinished(true);
    return result;
  }
  const getReservation = async(play_date_id:number=0):Promise<any> => {
    userSearchForm['play_date_id'] = play_date_id;
    let result = await functions.fetchData('GET', 'reservations', null, userSearchForm);
    console.log(result);
    if(!result.play_date){ 
      navigate('/', { replace: true });
      return {};
    }
    setReservations(result.reservations);
    return result;
  }

  const doPlayDate = (id) =>{
    let view_url = '/play?id='+id;
    console.log(view_url);
  }
  
  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <Box className="invisible pb-3"><AdminNav /></Box>

      <Box sx={{display:'flex', justifyContent:'center'}}>        
        { !initFinished && <>
          <Card sx={{ maxWidth: 345, minWidth: 275}}>
            <CardContent>
              <Typography gutterBottom variant="h4" component="div" className='flex justify-center'>
                <Skeleton animation="wave" variant="rounded" width={100}/>
              </Typography>
              <Typography variant="body2">
                <Skeleton animation="wave" width="60%"/>
                <Skeleton animation="wave" width="60%"/>
                <Skeleton animation="wave" width="45%"/>
                {/* <Skeleton animation="wave" width="30%"/> */}
                <Skeleton animation="wave"/>
              </Typography>
            </CardContent>
          </Card>
        </>}
        { initFinished && <>
          <Card sx={{ maxWidth: 345, minWidth: 275, }}>
            <CardContent>
              {cards.length>0 && <>
                <Typography gutterBottom variant="h5" component="div">
                  <Button size="large" 
                          onClick={() => doPlayDate(cards[0].id)}
                  >開始排點</Button>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} align='left'>
                  打球日期：{cards[0].datetime.split(" ")[0]}<br/>
                  打球時間：{cards[0].datetime.split(" ")[1]}~{cards[0].datetime2.split(" ")[1]}<br/>
                  球場位置：{cards[0].location}<br/>
                  {/* 球場面數：??<br/> */}
                  備註：{cards[0].note}
                </Typography>
              </>}
            </CardContent>
          </Card>
        </>}
      </Box>
      {/* <Divider className="pb-3" sx={{mb:2}}/> */}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="打球日相關設定"
              variant="scrollable" allowScrollButtonsMobile >
          <Tab icon={<GroupAddIcon />} value="tab1" aria-label="報名紀錄" />
          <Tab icon={<LibraryAddIcon />} value="tab2" aria-label="場地記錄" />
          <Tab icon={<ScoreboardIcon />} value="tab3" aria-label="比賽記錄" />
        </Tabs>
      </Box>
      <TabContext value={tabValue}>
        <TabPanel value="tab1">
          <Typography variant='h6' textAlign="left">報名紀錄</Typography>
          <Grid container spacing={0}>
            <Grid size={{xs:12, sm:11}}>
              <TextareaAutosize
                  aria-label="批次設定球員"
                  minRows={3}
                  placeholder="請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至本日報名紀錄中"
                  style={{ width: '100%' }}
                />
            </Grid>
            <Grid size={{xs:12, sm:1}}>
              <Button>送出</Button>
            </Grid>
          </Grid>
          <TableUsers updateBodyBlock={updateBodyBlock}
                            getData={getReservation}
                            where={userSearchForm}
                            numPerPage={0}
                            ref={TableUsersRef}/>
        </TabPanel>
        <TabPanel value="tab2">
          <Typography variant='h6' textAlign="left">場地記錄</Typography>
        </TabPanel>
        <TabPanel value="tab3">
          <Typography variant='h6' textAlign="left">比賽記錄</Typography>
        </TabPanel>
      </TabContext>

      <Box margin={'3rem'}></Box>
    </>
  )
}

export default Playdate
