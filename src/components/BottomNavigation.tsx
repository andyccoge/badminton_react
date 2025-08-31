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
import {Box, Divider} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/
const defaulMatchWhere = emptyMatchSearchForm;
defaulMatchWhere['per_p_num'] = numPerPage;

export type MyChildRef = { // 子暴露方法給父
  setUserPanelDrawerOpen:(status:any) => void;
  setMatchDrawerOpenOpen:(status:any) => void;

  setPlayMatchs:(result:{matchs:MatchData[]; user_map:any}) => void;
  showMatchs: (items:Array<MatchData>) => void;
  getMatchs: () => Array<MatchData>;
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
    updateBodyBlock, showConfirmModelStatus, playDateId='0', users=[],
    cleanSeletedCourtName, doSelectUser, setUserShowUp, setUserLeave, 
    userIdxMatch=[], userIdxMatchCode={}, userIdxPrepare=[], 
    setUserModel, setUserDrawer,
  }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  defaulMatchWhere['play_date_id'] = playDateId;
  React.useImperativeHandle(ref, () => ({
    setUserPanelDrawerOpen:(status:any) => {setUserPanelDrawerOpen(status)},
    setMatchDrawerOpenOpen:(status:any) => {setMatchDrawerOpenOpen(status)},
    setPlayMatchs:(result:{matchs:MatchData[]; user_map:any}) => {
      TableMatchsRef.current?.setPlayMatchs(result);
    },
    showMatchs:(items:Array<MatchData>) => {
      TableMatchsRef.current?.showRows(items);
    },
    getMatchs:() => {
      return TableMatchsRef.current?.getRows() ?? [];
    },
  }));

  const [userPanelOpen, setUserPanelDrawerOpen] = React.useState(false);
  const [matchDrawerOpen, setMatchDrawerOpenOpen] = React.useState(false);

  const TableMatchsRef = React.useRef<TableMatchsMyChildRef>(null);

  return (
    <>
      {/* 下方選單，點擊 User 時打開 Drawer */}
      <Menu onUserClick={async() => { await setUserPanelDrawerOpen(true); }}
            onMatchClick={async() => { await setMatchDrawerOpenOpen(true); }}
      />

      {/* 從底部彈出的 Drawer */}
      <Drawer anchor="bottom" open={userPanelOpen} hideBackdrop variant={'persistent'}
        sx={{maxHeight:'70vh', top:'unset', bottom:0}}
        ModalProps={{ keepMounted: true, /* 🔑 保持內容在 DOM 裡*/ }}
      >
        <UserPanel
          updateBodyBlock={updateBodyBlock}
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
      </Drawer>

      <Drawer anchor="bottom" open={matchDrawerOpen} sx={{maxHeight:'75vh', top:'unset', bottom:0}}
        ModalProps={{ keepMounted: true, /* 🔑 保持內容在 DOM 裡*/ }}
      >
        {/* hideBackdrop variant={'persistent'} */}
        <Box padding={'5px'}>
          &nbsp;
          <HighlightOffIcon onClick={()=>{setMatchDrawerOpenOpen(false)}} className='cursor-pointer' sx={{position:'absolute', right:5, top:8}}/>
        </Box>
        <Grid role="presentation" p={'0.25rem 0.25rem'} minHeight={'70vh'} overflow={'hidden'}>
          <Divider sx={{mb:'0.5rem'}}/>
          <TableMatchs updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                      where={defaulMatchWhere}
                      numPerPage={0}
                      needCheckBox={true}
                      ref={TableMatchsRef}/>
        </Grid>
      </Drawer>
    </>
  );
})
export default BottomNavigation;
