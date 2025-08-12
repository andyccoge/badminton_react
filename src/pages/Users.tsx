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
import UserModel, {MyChildRef as UserModelMyChildRef} from '../components/UserModel'

const numPerPage = 0; /*列表一頁顯示數量(0表示不使用分頁功能)*/

function Users({updateBodyBlock, showConfirmModelStatus}) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [initFinished, setInitFinished] = React.useState(false);
  const [users, setUers] = React.useState<any[]>([]);
  emptyUserSearchForm['per_p_num'] = numPerPage;
  const [userSearchForm, setuserSearchForm] = React.useState(JSON.parse(JSON.stringify(emptyUserSearchForm)));
  const TableUsersRef = React.useRef<TableUsersMyChildRef>(null);

  React.useEffect(() => {
    (async () => {
      updateBodyBlock(true); //顯示遮蓋
      try {
        await getUsers(userSearchForm);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const getUsers = async (where:any={}):Promise<any> => {
    setInitFinished(false);
    where = JSON.parse(JSON.stringify(where))
    if('ids' in where){ where['ids'] = JSON.stringify(where['ids']) }
    let result = await functions.fetchData('GET', 'users', null, where);
    setUers(result.data);
    TableUsersRef.current?.resetSelect();
    TableUsersRef.current?.showRows(result.data);
    setInitFinished(true);
    return result;
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
          await getUsers(userSearchForm);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        const data = error?.response?.data;
        if (typeof data === 'string' && data.match('fk_matchs_users_2')) {
          showMessage('此球員有比賽紀錄，不可刪除', 'error');
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

  const userModelRef = React.useRef<UserModelMyChildRef>(null);
  const clickTableUsers = (idx:number, item:any) => {
    // console.log(item);
    openUserModel(item.id, idx);
  }
  const reGetList = async (where:any=null):Promise<any[]> => {
    let result = getUsers(userSearchForm);
    return result;
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
              minRows={3}
              placeholder="請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至球員名單"
              style={{ width: '100%' }}
            />
        </Grid>
        <Grid size={{xs:12, sm:1}}>
          <Button>送出</Button>
        </Grid>
      </Grid>
      <TableUsers updateBodyBlock={updateBodyBlock}
                  getData={getUsers}
                  clickFirstCell={clickTableUsers}
                  where={userSearchForm}
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
