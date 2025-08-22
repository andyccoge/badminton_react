import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import {Drawer, Grid} from '@mui/material';
import Menu from './BottomNavigation/Menu';
import UserPanel from './BottomNavigation/UserPanel';
import {UserType} from '../components/UserNameCard';
import TableMatchs, {
  MyChildRef as TableMatchsMyChildRef, empty_searchForm as emptyMatchSearchForm, Data as MatchData
} from '../components/TableMatchs.tsx';
import {Box,Button,Divider} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/
const defaulMatchWhere = emptyMatchSearchForm;
defaulMatchWhere['per_p_num'] = numPerPage;

export type MyChildRef = { // 子暴露方法給父
  setUserPanelDrawerOpen:(status:any) => void;
  setMatchDrawerOpenOpen:(status:any) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status) => void;
  showConfirmModelStatus: (
    title: string,
    message: string,
    do_function_name?: string,
    do_function?: ()=> Promise<boolean>,
  ) => void;
  playDateId?: string,
  users?:UserType[];
  matchs?:MatchData[];
  user_map?:any;
  setPlayMatchs?: (result:{matchs:MatchData[]; user_map:any}) => void;
  cleanSeletedCourtName?: () => void;
  doSelectUser?: (userIdx:number) => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  userIdxMatch?:number[];
  userIdxMatchCode?:{};
  userIdxPrepare?:number[];
  setUserModel?: (idx:number, item:any) => void;
  setUserDrawer?: (idx:number, item:any) => void;
};
const BottomNavigation = React.forwardRef<MyChildRef, MyChildProps>((
  {
    updateBodyBlock, showConfirmModelStatus, playDateId='0', users=[], matchs=[], user_map={}, setPlayMatchs,
    cleanSeletedCourtName, doSelectUser, setUserShowUp, setUserLeave, 
    userIdxMatch=[], userIdxMatchCode={}, userIdxPrepare=[], 
    setUserModel, setUserDrawer,
  }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  React.useImperativeHandle(ref, () => ({
    setUserPanelDrawerOpen:(status:any) => {setUserPanelDrawerOpen(status)},
    setMatchDrawerOpenOpen:(status:any) => {setMatchDrawerOpenOpen(status)},
  }));

  const [userPanelOpen, setUserPanelDrawerOpen] = React.useState(false);
  const [matchDrawerOpen, setMatchDrawerOpenOpen] = React.useState(false);

  const TableMatchsRef = React.useRef<TableMatchsMyChildRef>(null);
  const getMatchs = async(where:any={}) => {
    // if(playDateId){ where['play_date_id'] = playDateId; }
    try {
      let result = await functions.fetchData('GET', 'matchs', null, where);
      if(setPlayMatchs){ setPlayMatchs(result); }
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
    // console.log(selectedIds);
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
    // if(idx<0 && idx>=matchs.length){ return; }
    // MatchModelRef.current?.setUserMap(user_map);
    // MatchModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }

  return (
    <>
      {/* 下方選單，點擊 User 時打開 Drawer */}
      <Menu onUserClick={() => setUserPanelDrawerOpen(true)}
            onMatchClick={() => setMatchDrawerOpenOpen(true)} />

      {/* 從底部彈出的 Drawer */}
      <UserPanel
        updateBodyBlock={updateBodyBlock}
        open={userPanelOpen}
        onClose={() => {
          setUserPanelDrawerOpen(false);
          if(cleanSeletedCourtName){cleanSeletedCourtName()};
        }}
        users={users}
        doSelectUser={doSelectUser}
        setUserShowUp={setUserShowUp}
        setUserLeave={setUserLeave}
        userIdxMatch={userIdxMatch}
        userIdxMatchCode={userIdxMatchCode}
        userIdxPrepare={userIdxPrepare}
        setUserModel={setUserModel}
        setUserDrawer={setUserDrawer}
      />

      <Drawer anchor="bottom" open={matchDrawerOpen} sx={{maxHeight:'75vh', top:'unset', bottom:0}}>
         {/* hideBackdrop variant={'persistent'} */}
        <Box padding={'5px'}>
          &nbsp;
          <HighlightOffIcon onClick={()=>{setMatchDrawerOpenOpen(false)}} className='cursor-pointer' sx={{position:'absolute', right:5, top:8}}/>
        </Box>
        <Grid role="presentation" p={'0.25rem 0.25rem'} minHeight={'70vh'} overflow={'hidden'}>
          <Divider sx={{mb:'0.5rem'}}/>
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
        </Grid>
      </Drawer>
    </>
  );
})
export default BottomNavigation;
