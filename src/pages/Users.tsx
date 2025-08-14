import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import {Box, Grid, Skeleton, Divider} from '@mui/material';
import {Button, Typography, TextareaAutosize} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import AdminNav from '../components/AdminNav.tsx'
import TableUsers, {
  MyChildRef as TableUsersMyChildRef, empty_searchForm as emptyUserSearchForm
} from '../components/TableUsers.tsx';
import UserModel, {MyChildRef as UserModelMyChildRef} from '../components/UserModel';

import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import { FormHelperText } from '@mui/material';

const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/
const defaultWhere = emptyUserSearchForm;
defaultWhere['per_p_num'] = numPerPage;

function Users({updateBodyBlock, showConfirmModelStatus}) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [users, setUers] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      updateBodyBlock(true); //顯示遮蓋
      try {
        await TableUsersRef.current?.goSearch();
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('取得球員資料發生錯誤', 'error');
      }
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const getUsers = async (where:any={}) => {
    try {
      let result = await functions.fetchData('GET', 'users', null, where);
      setUers(result.data);
      TableUsersRef.current?.resetSelect();
      TableUsersRef.current?.showRows(result.data);
    } catch (error) {
      showMessage('取得球員資料發生錯誤', 'error');
    }
  }
  const deleteSelectedIds = async ()=>{
    let selectedIds = TableUsersRef.current?.getSelectedIds();
    console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'users', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          TableUsersRef.current?.goSearch();
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        const data = error?.response?.data;
        if (typeof data === 'string') {
          if (
            data.match('fk_matchs_users_1') || 
            data.match('fk_matchs_users_2') || 
            data.match('fk_matchs_users_3') || 
            data.match('fk_matchs_users_4')
          ){
            showMessage('此球員有比賽紀錄，不可刪除', 'error');
          }else{
            showMessage('發生錯誤', 'error');
          }
        }else{
          showMessage('發生錯誤', 'error');
        }
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】位球員，確認執行嗎？`,
      '確認',
      do_function
    );
  }
  const openUserModel = (id, index) =>{
    let tempData = index==-1 ? {} : users[index]
    // console.log(id+':'+index)
    userModelRef.current?.setModel(index, tempData); // 呼叫 child 的方法
  }

  const [batchUserText, setBatchUserText] = React.useState("");
  const [batchAddModelStatus, setbatchAddModelStatus] = React.useState(false);
  const [repeatName, setRepeatName] = React.useState<string>();
  const [repeatLine, setRepeatLine] = React.useState<string>();
  const [OkNames, setOkNames] = React.useState<string>();
  async function batchAdd(tempStr:string='',  batchUserForceAdd:string='') {
    if(!batchUserText.trim()){
      showMessage('請設定名單，以「換行」分隔球員', 'error');
      return;
    }
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let names = functions.getTextareaUserNames(tempStr ? tempStr : batchUserText);
    console.log(names);

    try {
      let result = await functions.fetchData('POST', 'user_batch', {names:names, force:batchUserForceAdd});
      if(result.repeat_name.length>0 || result.repeat_line.length>0){
        setRepeatName(result.repeat_name.join("\n"))
        setRepeatLine(result.repeat_line.join("\n"))
        setOkNames(result.ok_names.join("\n"))
        setbatchAddModelStatus(true)
      }else{
        setBatchUserText('');
        await TableUsersRef.current?.goSearch();
        showMessage('球員已新增', 'success');
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('發生錯誤', 'error');
    }
    updateBodyBlock(false); //隱藏遮蓋
  }
  async function sendNames() {
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let tempStr = '';
    tempStr += repeatName ? ("\n"+repeatName)?.toString() : '';
    tempStr += repeatLine ? ("\n"+repeatLine)?.toString() : '';
    tempStr += OkNames ? ("\n"+OkNames)?.toString() : '';
    tempStr = tempStr.trim();
    setBatchUserText(tempStr);
    setbatchAddModelStatus(false);
    await batchAdd(tempStr, 'force');
    updateBodyBlock(false); //隱藏遮蓋
  }

  const TableUsersRef = React.useRef<TableUsersMyChildRef>(null);
  const clickTableUsers = (idx:number, item:any) => {
    // console.log(item);
    openUserModel(item.id, idx);
  }

  const userModelRef = React.useRef<UserModelMyChildRef>(null);
  const reGetList = async () => {
    TableUsersRef.current?.goSearch();
  }
  const renewList = async (idx, item)=>{
    users[idx] = item;
    setUers(users);
    TableUsersRef.current?.showRows(users);
  }

  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <div className="invisible pb-2"><AdminNav /></div>

      <Typography variant='h6' textAlign="left">球員名單</Typography>
      <Grid container spacing={0} sx={{mb:'1rem'}}>
        <Grid size={{xs:12, sm:11}}>
          <TextareaAutosize
              aria-label="球員名單"
              minRows={3} maxRows={3}
              placeholder="請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至球員名單"
              style={{ width: '100%' }}
              value={batchUserText}
              onChange={(e) => setBatchUserText(e.target.value)}
            />
        </Grid>
        <Grid size={{xs:12, sm:1}}>
          <Button onClick={()=>{batchAdd()}}>送出</Button>
        </Grid>
      </Grid>
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
            <FormHelperText error={true}>此區球員名稱重複，請修改or刪除後再次送出資料</FormHelperText>
            <TextareaAutosize
              aria-label="重複姓名名單"
              minRows={3} maxRows={3}
              placeholder="此區球員名稱重複，請修改or刪除後再次送出資料"
              style={{ width: '100%', marginBottom:'1rem', }}
              value={repeatName}
              onChange={(e) => setRepeatName(e.target.value)}
            />
            
            <FormHelperText error={true}>此區名單可新增，但因與其他球員重複，未來挑選人員可能造成混淆，建議適當修改</FormHelperText>
            <TextareaAutosize
              aria-label="重複LINE名稱名單"
              minRows={3} maxRows={3}
              placeholder="此區名單可新增，但因與其他球員重複，未來挑選人員可能造成混淆，建議適當修改"
              style={{ width: '100%', marginBottom:'1rem', }}
              value={repeatLine}
              onChange={(e) => setRepeatLine(e.target.value)}
            />

            <FormHelperText error={false}>可新增名單</FormHelperText>
            <TextareaAutosize
              aria-label="可新增名單"
              minRows={3} maxRows={3}
              placeholder="此區名單無問題，可直接新增"
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

      <TableUsers updateBodyBlock={updateBodyBlock}
                  getData={getUsers}
                  clickFirstCell={clickTableUsers}
                  where={defaultWhere}
                  numPerPage={numPerPage}
                  needCheckBox={true}
                  ref={TableUsersRef}/>
      <Box textAlign="left" sx={{mt:'1rem'}}>
        <Button size="small" variant="contained" color='error' onClick={deleteSelectedIds}>
          <DeleteForeverIcon />
        </Button>
      </Box>

      <Box className="fixed bottom-0 right-0" 
            onClick={() => openUserModel(-1,-1)}
            sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab size="small" color="secondary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>

      <UserModel updateBodyBlock={updateBodyBlock}
                  reGetList={reGetList}
                  renewList={renewList}
                  ref={userModelRef} />
    </>
  )
}

export default Users;
