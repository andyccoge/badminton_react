import * as functions from '../functions.tsx';
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

import AdminNav from '../components/AdminNav.tsx'
import TableUsers, {
  MyChildRef as TableUsersMyChildRef, empty_searchForm as emptyUserSearchForm
} from '../components/TableUsers.tsx';
import UserModel, {MyChildRef as UserModelMyChildRef} from '../components/UserModel';
import TableCourts, {
  MyChildRef as TableCourtsMyChildRef, empty_searchForm as emptyCourtSearchForm
} from '../components/TableCourts.tsx';
import CourtModel, {MyChildRef as CourtModelMyChildRef} from '../components/CourtModel';
import TableMatchs, {
  MyChildRef as TableMatchsMyChildRef, empty_searchForm as emptyMatchSearchForm
} from '../components/TableMatchs.tsx';
import MatchModel, {MyChildRef as MatchModelMyChildRef} from '../components/MatchModel';

import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import { FormHelperText } from '@mui/material';

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
  const [courts, setCourts] = React.useState<any[]>([]);
  const [matchs, setMatchs] = React.useState<any[]>([]);
  const [cards, setCards] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [user_map, setUserMap] = React.useState<any>({});

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
        setUserMap(result.user_map);
        setMatchs(result.matchs);
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
  React.useEffect(() => {
    if (tabValue === 'tab1' && TableUsersRef.current) {
      TableUsersRef.current?.showRows(reservations);
    }
    else if(tabValue === 'tab2' && TableCourtsRef.current){
      TableCourtsRef.current?.showRows(courts);
    }
    else if(tabValue === 'tab3' && TableMatchsRef.current){
      TableMatchsRef.current?.showRows(matchs);
    }
  }, [tabValue]);

  const [batchUserText, setBatchUserText] = React.useState("");
  const [batchAddModelStatus, setbatchAddModelStatus] = React.useState(false);
  const [repeatName, setRepeatName] = React.useState<string>();
  const [fuzzyNames, setFuzzyNamesNames] = React.useState<string>();
  const [OkNames, setOkNames] = React.useState<string>();
  async function batchAdd(tempStr:string='') {
    if(!batchUserText.trim()){
      showMessage('請設定名單，以「換行」分隔球員', 'error');
      return;
    }
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let names = functions.getTextareaUserNames(tempStr ? tempStr : batchUserText);
    console.log(names);

    try {
      let result = await functions.fetchData('PUT', 'user_batch', {names:names, play_date_id:play_date_id});
      if(result.repeat_name.length>0 || result.fuzzy_names.length>0){
        setRepeatName(result.repeat_name.join("\n"))
        setFuzzyNamesNames(result.fuzzy_names.join("\n"))
        setOkNames(result.ok_names.join("\n"))
        setbatchAddModelStatus(true)
      }else{
        setBatchUserText('');
        await TableUsersRef.current?.goSearch();
        showMessage('報名紀錄已新增', 'success');
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('批次設定報名紀錄發生錯誤', 'error');
    }
    updateBodyBlock(false); //隱藏遮蓋
  }
  async function sendNames() {
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let tempStr = '';
    tempStr += repeatName ? ("\n"+repeatName)?.toString() : '';
    tempStr += fuzzyNames ? ("\n"+fuzzyNames)?.toString() : '';
    tempStr += OkNames ? ("\n"+OkNames)?.toString() : '';
    tempStr = tempStr.trim();
    setBatchUserText(tempStr);
    setbatchAddModelStatus(false);
    await batchAdd(tempStr);
    updateBodyBlock(false); //隱藏遮蓋
  }

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
    UserModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }

  const UserModelRef = React.useRef<UserModelMyChildRef>(null);
  const reGetListUsers = async () => {
    TableUsersRef.current?.goSearch();
  }
  const renewListUsers = async (idx, item)=>{
    reservations[idx] = item;
    setReservations(reservations);
    TableUsersRef.current?.showRows(reservations);
  }

  const TableCourtsRef = React.useRef<TableCourtsMyChildRef>(null);
  const getCourts = async(where:any={}) => {
    TableCourtsRef.current?.showRows([]);
    try {
      let result = await functions.fetchData('GET', 'courts', null, where);
      setCourts(result.data);
      TableCourtsRef.current?.resetSelect();
      TableCourtsRef.current?.showRows(result.data);
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('取得場地紀錄資料發生錯誤', 'error');
    }
  }
  const deleteSelectedCourtIds = async ()=>{
    let selectedIds = TableCourtsRef.current?.getSelectedIds();
    console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'courts', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          TableCourtsRef.current?.goSearch();
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        const data = error?.response?.data;
        if (typeof data === 'string') {
          if (data.match('fk_matchs_courts')){
            showMessage('有對應此場地的比賽紀錄，不可刪除', 'error');
          }else{
            showMessage('刪除場地紀錄發生錯誤', 'error');
          }
        }else{
          showMessage('刪除場地紀錄發生錯誤', 'error');
        }
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】個場地紀錄，確認執行嗎？`,
      '確認',
      do_function
    );
  }
  const clickTableCourts = (idx:number, item:any) => {
    // console.log(item);
    if(idx<0 && idx>=reservations.length){ return; }
    CourtModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }

  const CourtModelRef = React.useRef<CourtModelMyChildRef>(null);
  const reGetListCourts = async () => {
    TableCourtsRef.current?.goSearch();
  }
  const renewListCourts = async (idx, item)=>{
    courts[idx] = item;
    setReservations(courts);
    TableCourtsRef.current?.showRows(courts);
  }

  const TableMatchsRef = React.useRef<TableMatchsMyChildRef>(null);
  const getMatchs = async(where:any={}) => {
    TableMatchsRef.current?.showRows([]);
    try {
      let result = await functions.fetchData('GET', 'matchs', null, where);
      setUserMap(result.user_map);
      setMatchs(result.data);
      TableMatchsRef.current?.resetSelect();
      TableMatchsRef.current?.setUserMap(result.user_map);
      TableMatchsRef.current?.showRows(result.data);
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('取得比賽紀錄資料發生錯誤', 'error');
    }
  }
  const deleteSelectedMatchIds = async ()=>{
    let selectedIds = TableMatchsRef.current?.getSelectedIds();
    console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'matchs', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          TableMatchsRef.current?.goSearch();
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('刪除比賽紀錄發生錯誤', 'error');
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】個比賽紀錄，確認執行嗎？`,
      '確認',
      do_function
    );
  }
  const clickTableMatchs = (idx:number, item:any) => {
    // console.log(item);
    if(idx<0 && idx>=matchs.length){ return; }
    MatchModelRef.current?.setUserMap(user_map);
    MatchModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }

  const MatchModelRef = React.useRef<MatchModelMyChildRef>(null);
  const reGetListMatchs = async () => {
    TableMatchsRef.current?.goSearch();
  }
  const renewListMatchs = async (idx, item)=>{
    item['duration'] = Number(item['duration']);
    matchs[idx] = item;
    setMatchs(matchs);
    TableMatchsRef.current?.showRows(matchs);
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
          <Grid container spacing={0} sx={{mb:'1rem'}}>
            <Grid size={{xs:12, sm:11}}>
              <TextareaAutosize
                  aria-label="批次設定球員"
                  minRows={3} maxRows={3}
                  placeholder="請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至本日報名紀錄中"
                  style={{ width: '100%' }}
                  value={batchUserText}
                  onChange={(e) => setBatchUserText(e.target.value)}
                />
            </Grid>
            <Grid size={{xs:12, sm:1}}>
              <Button onClick={()=>{batchAdd()}}>送出</Button>
            </Grid>
          </Grid>
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
        <TabPanel value="tab2">
          <Typography variant='h6' textAlign="left" gutterBottom>
            <Box sx={{marginRight: '1rem', display:'inline-block'}}>場地記錄</Box>
            <Fab size="small" color="secondary" aria-label="add"
                onClick={()=>{CourtModelRef.current?.setModel(-1, {play_date_id:play_date_id})}}
              ><AddIcon />
            </Fab>
          </Typography>
          <TableCourts updateBodyBlock={updateBodyBlock}
                            getData={getCourts}
                            clickFirstCell={clickTableCourts}
                            where={defaulCourtWhere}
                            numPerPage={0}
                            needCheckBox={true}
                            ref={TableCourtsRef}/>
          <Box textAlign="left" sx={{mt:'1rem'}}>
            <Button size="small" variant="contained" color='error' onClick={deleteSelectedCourtIds}>
              <DeleteForeverIcon />
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value="tab3">
          <Typography variant='h6' textAlign="left" gutterBottom>比賽記錄</Typography>
          <TableMatchs updateBodyBlock={updateBodyBlock}
                            getData={getMatchs}
                            clickFirstCell={clickTableMatchs}
                            where={defaulMatchWhere}
                            numPerPage={0}
                            needCheckBox={true}
                            userMap={user_map}
                            ref={TableMatchsRef}/>
          <Box textAlign="left" sx={{mt:'1rem'}}>
            <Button size="small" variant="contained" color='error' onClick={deleteSelectedMatchIds}>
              <DeleteForeverIcon />
            </Button>
          </Box>
        </TabPanel>
      </TabContext>

      <Box margin={'3rem'}></Box>

      <UserModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetListUsers}
                  renewList={renewListUsers}
                  ref={UserModelRef} />
      <CourtModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetListCourts}
                  renewList={renewListCourts}
                  ref={CourtModelRef} />
      <MatchModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetListMatchs}
                  renewList={renewListMatchs}
                  userMap={user_map}
                  ref={MatchModelRef} />
      <React.Fragment>
        <Dialog
          open={batchAddModelStatus}
          keepMounted
          onClose={()=>{setbatchAddModelStatus(false)}}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle sx={{pb:'0.5rem'}}>
            {"重複資料處理"}
            <Typography variant="body2" gutterBottom>完成操作後請點「送出」再次進行資料新增</Typography>
          </DialogTitle>
          <DialogContent>
            <FormHelperText error={true}>此區球員重複報名，請修改or刪除後再次送出資料</FormHelperText>
            <TextareaAutosize
              aria-label="重複報名名單"
              minRows={3} maxRows={3}
              placeholder="此區球員重複報名，請修改or刪除後再次送出資料"
              style={{ width: '100%', marginBottom:'1rem', }}
              value={repeatName}
              onChange={(e) => setRepeatName(e.target.value)}
            />
            
            <FormHelperText error={true}>
              此區名單在系統中對應到多個球員，請保留「:」後的一組資料，其餘請刪除，然後重新送出。<br />
              ex： 安安:[陳彥安,安仔,男] 對應關係如右=&gt; LINE名稱:[姓名,綽號,性別]
            </FormHelperText>
            <TextareaAutosize
              aria-label="模糊名稱名單"
              minRows={3} maxRows={3}
              placeholder={
                "此區名單在系統中對應到多個球員，請保留「:」後的一組資料，其餘請刪除，然後重新送出。"+"\n"+
                "ex： 安安:[陳彥安,安仔,男]"
              }
              style={{ width: '100%', marginBottom:'1rem', }}
              value={fuzzyNames}
              onChange={(e) => setFuzzyNamesNames(e.target.value)}
            />

            <FormHelperText error={false}>可新增名單(新名單將自動建立「球員資料」)</FormHelperText>
            <TextareaAutosize
              aria-label="可新增名單"
              minRows={3} maxRows={3}
              placeholder="可新增名單(新名單將自動建立「球員資料」"
              style={{ width: '100%', marginBottom:'1rem', }}
              value={OkNames}
              onChange={(e) => setOkNames(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>{setbatchAddModelStatus(false)}} size="small" color="secondary">取消</Button>
            <Button onClick={()=>{sendNames()}} size="medium" color="primary">送出</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </>
  )
}

export default Playdate
