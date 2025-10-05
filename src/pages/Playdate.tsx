import * as functions from '../functions';
import * as React from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {Box, Grid, Skeleton, Divider} from '@mui/material';
import {Card,CardContent} from '@mui/material';
import {Button, Typography, TextareaAutosize} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import {TabContext, TabList, TabPanel} from '@mui/lab';
import {Tabs, Tab} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';

import AdminNav from '../components/AdminNav';
import TextAreaBatchReservation from '../components/TextAreaBatchReservation';
import TableUsers, {
  MyChildRef as TableUsersMyChildRef, empty_searchForm as emptyUserSearchForm
} from '../components/TableUsers';
import UserModel, {MyChildRef as UserModelMyChildRef} from '../components/Model/UserModel';
import TableCourts, {
  MyChildRef as TableCourtsMyChildRef, empty_searchForm as emptyCourtSearchForm
} from '../components/TableCourts';
import TableMatchs, {
  MyChildRef as TableMatchsMyChildRef, empty_searchForm as emptyMatchSearchForm
} from '../components/TableMatchs';

const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/
const defaulUsertWhere = emptyUserSearchForm;
defaulUsertWhere['per_p_num'] = numPerPage;
const defaulCourtWhere = emptyCourtSearchForm;
defaulCourtWhere['per_p_num'] = numPerPage;
const defaulMatchWhere = emptyMatchSearchForm;
defaulMatchWhere['per_p_num'] = numPerPage;

function Playdate({updateBodyBlock, showConfirmModelStatus}) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  // 預設篩選條件(限本打球日)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const play_date_id:string | null = searchParams.get('id') || '0';
  defaulUsertWhere['play_date_id'] = play_date_id;
  defaulCourtWhere['play_date_id'] = play_date_id;
  defaulMatchWhere['play_date_id'] = play_date_id;

  const [initFinished, setInitFinished] = React.useState(false);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);

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
        TableCourtsRef.current?.showRows(result.courts);
        TableMatchsRef.current?.setPlayMatchs(result);
        setCards([result.play_date]);
        setReservations(result.reservations);
        TableUsersRef.current?.showRows(result.reservations);
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('取得打球日完整設定資料發生錯誤', 'error');
      }
      setInitFinished(true);
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const doPlayDate = (id) =>{
    let view_url = '/play?id='+id;
    // console.log(view_url);
    window.open(view_url); /*開新頁面*/
    // location.href = view_url; /*頁面導向*/
  }


  const [tabValue, setTabValue] = React.useState('tab1');
  const handleTabChange = (event: React.SyntheticEvent, newTabValue: string) => {
    setTabValue(newTabValue);
  };

  const TableUsersRef = React.useRef<TableUsersMyChildRef>(null);
  const getReservation = async(where:any={}) => {
    TableUsersRef.current?.showRows([]);
    try {
      let result = await functions.fetchData('GET', 'reservations', null, where);
      setReservations(result.data);
      TableUsersRef.current?.resetSelect();
      TableUsersRef.current?.showRows(result.data);
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('取得報名紀錄資料發生錯誤', 'error');
    }
  }
  const deleteSelectedUserIds = async ()=>{
    let selectedIds = TableUsersRef.current?.getSelectedIds();
    console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'reservations', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          TableUsersRef.current?.goSearch();
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('刪除報名紀錄發生錯誤', 'error');
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】個報名紀錄，確認執行嗎？`,
      '確認',
      do_function
    );
  }
  const clickTableUsers = (idx:number, item:any) => {
    // console.log(item);
    if(idx<0 && idx>=reservations.length){ return; }
    UserModelRef.current?.setModel(idx, item, 'user_id'); // 呼叫 child 的方法
  }

  const UserModelRef = React.useRef<UserModelMyChildRef>(null);
  const reGetListUsers = async () => {
    TableUsersRef.current?.goSearch();
  }
  const renewListUsers = async (idx, item)=>{
    reservations[idx] = {...reservations[idx], ...item};
    setReservations(reservations);
    TableUsersRef.current?.showRows(reservations);
  }

  const TableCourtsRef = React.useRef<TableCourtsMyChildRef>(null);

  const TableMatchsRef = React.useRef<TableMatchsMyChildRef>(null);

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
        <TabPanel value="tab1" keepMounted>
          <Typography variant='h6' textAlign="left">報名紀錄</Typography>
          <TextAreaBatchReservation updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                                    playDateId={play_date_id}
                                    renewReservations={async()=>{await TableUsersRef.current?.goSearch();}}/>
          <TableUsers updateBodyBlock={updateBodyBlock}
                            getData={getReservation}
                            clickFirstCell={clickTableUsers}
                            where={defaulUsertWhere}
                            numPerPage={0}
                            needCheckBox={true}
                            ref={TableUsersRef}/>
          <Box textAlign="left" sx={{mt:'1rem'}}>
            <Button size="small" variant="contained" color='error' onClick={deleteSelectedUserIds}>
              <DeleteForeverIcon />
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value="tab2" keepMounted>
          <Typography variant='h6' textAlign="left" gutterBottom>
            <Box sx={{marginRight: '1rem', display:'inline-block'}}>場地記錄</Box>
            <Fab size="small" color="secondary" aria-label="add"
                onClick={()=>{TableCourtsRef.current?.setModel(-1, {play_date_id:play_date_id})}}
              ><AddIcon />
            </Fab>
          </Typography>
          <TableCourts updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                      where={defaulCourtWhere}
                      numPerPage={0}
                      needCheckBox={true}
                      ref={TableCourtsRef}/>
        </TabPanel>
        <TabPanel value="tab3" keepMounted>
          <Typography variant='h6' textAlign="left" gutterBottom>比賽記錄</Typography>
          <TableMatchs updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                      where={defaulMatchWhere}
                      numPerPage={0}
                      needCheckBox={true}
                      ref={TableMatchsRef}/>
        </TabPanel>
      </TabContext>

      <Box margin={'3rem'}></Box>

      <UserModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetListUsers}
                  renewList={renewListUsers}
                  ref={UserModelRef} />
    </>
  )
}

export default Playdate
