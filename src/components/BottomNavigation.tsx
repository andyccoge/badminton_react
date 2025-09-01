import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import {Drawer, Grid, Box, Divider, Button, Fab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {Dialog,DialogContent,DialogTitle} from '@mui/material';

import Menu from './BottomNavigation/Menu';
import UserPanel from './BottomNavigation/UserPanel';
import TextAreaBatchReservation from '../components/TextAreaBatchReservation.tsx';
import {UserType} from '../components/UserNameCard';
import TableCourts, {
  MyChildRef as TableCourtsMyChildRef, empty_searchForm as emptyCourtSearchForm, Data as CourtData
} from '../components/TableCourts.tsx';
import TableMatchs, {
  MyChildRef as TableMatchsMyChildRef, empty_searchForm as emptyMatchSearchForm, Data as MatchData
} from '../components/TableMatchs.tsx';


const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/

export type MyChildRef = { // 子暴露方法給父
  setUserPanelDrawerOpen:(status:boolean) => void;
  setCourtDrawerOpenOpen:(status:boolean) => void;
  setMatchDrawerOpenOpen:(status:boolean) => void;

  setCourts:(courts:CourtData[]) => void;
  setCourtsModel: (idx, item, primaryKey?) => void;

  setPlayMatchs:(result:{matchs:MatchData[]; user_map:{[key: string]: UserType}}) => void;
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
  renewReservations?: ()=> void;
  cleanSeletedCourtName?: () => void;
  doSelectUser?: (userIdx:number) => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  userIdxMatch?:number[];
  userIdxMatchCode?:{};
  userIdxPrepare?:number[];
  setUserModel?: (idx:number, item:any) => void;
  setUserDrawer?: (idx:number, item:any) => void;
  renewCourts?: (items:CourtData[]) => void;
  renewCourt?: (idx:number, item:CourtData) => void;
  checkCourtsEditable?: (idx:number, item:CourtData) => string;
};
const BottomNavigation = React.forwardRef<MyChildRef, MyChildProps>((
  {
    updateBodyBlock, showConfirmModelStatus, playDateId='0', users=[], renewReservations=()=>{},
    cleanSeletedCourtName, doSelectUser, setUserShowUp, setUserLeave, 
    userIdxMatch=[], userIdxMatchCode={}, userIdxPrepare=[], 
    setUserModel, setUserDrawer, renewCourts, renewCourt, checkCourtsEditable,
  }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const defaulCourtWhere = emptyCourtSearchForm;
  defaulCourtWhere['per_p_num'] = numPerPage;
  defaulCourtWhere['play_date_id'] = playDateId;
  const defaulMatchWhere = emptyMatchSearchForm;
  defaulMatchWhere['per_p_num'] = numPerPage;
  defaulMatchWhere['play_date_id'] = playDateId;

  React.useImperativeHandle(ref, () => ({
    setUserPanelDrawerOpen:(status:boolean) => {setUserPanelDrawerOpen(status)},
    setCourtDrawerOpenOpen:(status:boolean) => {setCourtDrawerOpenOpen(status)},
    setMatchDrawerOpenOpen:(status:boolean) => {setMatchDrawerOpenOpen(status)},
    
    setCourts:(courts:CourtData[]) => { TableCourtsRef.current?.showRows(courts); },
    setCourtsModel: (idx, item, primaryKey?) => {
      TableCourtsRef.current?.setModel(idx, item, primaryKey);
    },

    setPlayMatchs:(result:{matchs:MatchData[]; user_map:{[key: string]: UserType}}) => {
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
  const [courtDrawerOpen, setCourtDrawerOpenOpen] = React.useState(false);
  const [matchDrawerOpen, setMatchDrawerOpenOpen] = React.useState(false);

  const TableCourtsRef = React.useRef<TableCourtsMyChildRef>(null);

  const TableMatchsRef = React.useRef<TableMatchsMyChildRef>(null);

  const [openTextAreaBatchReservation, setTextAreaBatchReservationOpen] = React.useState(false);

  return (
    <>
      {/* 下方選單，點擊 User 時打開 Drawer */}
      <Menu onUserClick={async() => { await setUserPanelDrawerOpen(true); }}
            onCourtClick={async() => { await setCourtDrawerOpenOpen(true); }}
            onMatchClick={async() => { await setMatchDrawerOpenOpen(true); }}
      />

      {/* 從底部彈出的 Drawer */}
      <Drawer anchor="bottom" open={userPanelOpen} hideBackdrop variant={'persistent'}
        sx={{maxHeight:'70vh', top:'unset', bottom:0}}
        ModalProps={{ keepMounted: true, /* 🔑 保持內容在 DOM 裡*/ }}
      >
        <Box padding={'5px'} display={'flex'} justifyContent={'space-between'}>
          <Box>
            <Fab size="small" color="secondary" aria-label="add" sx={{marginRight:'0.5rem'}}
                onClick={()=>{setTextAreaBatchReservationOpen(true)}}
              ><AddIcon />
            </Fab>
            <AutorenewIcon color={'inherit'} fontSize={'small'} className='cursor-pointer' onClick={()=>{renewReservations()}}/>
          </Box>
          <Box display={'flex'} alignItems={'center'}>
            <Button size='small' sx={{mr:'1rem'}} onClick={()=>{if(setUserShowUp){setUserShowUp(-1)}}}>
              全部報到 <EmojiPeopleIcon/>
            </Button>
            <Button size='small' color='secondary' onClick={()=>{if(setUserLeave){setUserLeave(-1)}}}>
              全部離場 <DirectionsWalkIcon/>
            </Button>
          </Box>
          <HighlightOffIcon onClick={() => {
            setUserPanelDrawerOpen(false);
            if(cleanSeletedCourtName){cleanSeletedCourtName()};
          }} className='cursor-pointer'/>
        </Box>
        <UserPanel
          updateBodyBlock={updateBodyBlock}
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

      <Drawer anchor="bottom" open={courtDrawerOpen} sx={{maxHeight:'75vh', top:'unset', bottom:0}}
        ModalProps={{ keepMounted: true, /* 🔑 保持內容在 DOM 裡*/ }}
      >
        {/* hideBackdrop variant={'persistent'} */}
        <Box padding={'5px'}>
          <Fab size="small" color="secondary" aria-label="add"
              onClick={()=>{TableCourtsRef.current?.setModel(-1, {play_date_id:playDateId})}}
            ><AddIcon />
          </Fab>
          <HighlightOffIcon onClick={()=>{setCourtDrawerOpenOpen(false)}} className='cursor-pointer' sx={{position:'absolute', right:5, top:8}}/>
        </Box>
        <Grid role="presentation" p={'0.25rem 0.25rem'} minHeight={'70vh'} overflow={'hidden'}>
          <Divider sx={{mb:'0.5rem'}}/>
          <TableCourts updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                      where={defaulCourtWhere}
                      numPerPage={0}
                      needSearch={false}
                      needCheckBox={true}
                      renewCourts={renewCourts}
                      renewCourt={renewCourt}
                      checkCourtsEditable={checkCourtsEditable}
                      ref={TableCourtsRef}/>
        </Grid>
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

      <React.Fragment>
        <Dialog
          open={openTextAreaBatchReservation}
          slots={{
            transition: functions.Transition,
          }}
          keepMounted
          onClose={()=>{setTextAreaBatchReservationOpen(false);}}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"批次添加報名"}</DialogTitle>
          <DialogContent>
            <TextAreaBatchReservation updateBodyBlock={updateBodyBlock} showConfirmModelStatus={showConfirmModelStatus}
                                      playDateId={playDateId}
                                      renewReservations={()=>{renewReservations()}}/>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </>
  );
})
export default BottomNavigation;
