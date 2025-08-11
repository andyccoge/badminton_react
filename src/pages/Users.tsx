import * as functions from '../functions.tsx';
import * as React from 'react';

import {Box, Grid, Skeleton, Divider} from '@mui/material';
import {Button, Typography, TextareaAutosize} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import AdminNav from '../components/AdminNav.tsx'
import TableUsers, {
  MyChildRef as TableUsersMyChildRef, empty_searchForm as emptyUserSearchForm
} from '../components/TableUsers.tsx';

function Users({updateBodyBlock}) {
  const [initFinished, setInitFinished] = React.useState(false);
  const [users, setUers] = React.useState<any[]>([]);
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
      alert('請勾選刪除項目');return;
    }
    else if(confirm(`確定刪除勾選的【`+ selectedIds?.length + `】位球員？`)){
      updateBodyBlock(true);
      let result = await functions.fetchData('DELETE', 'users', null, {ids:selectedIds});
      if(result.msg){
        alert(result.msg);
      }else{
        await getUsers(userSearchForm);
      }
      updateBodyBlock(false);
    }
  }
  const openUserModel = (id, index) =>{
    let tempData = index==-1 ? {} : users[index]
    // console.log(id+':'+index)
    // playDateModelRef.current?.setModel(index, tempData); // 呼叫 child 的方法
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
                  where={userSearchForm}
                  numPerPage={0}
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
    </>
  )
}

export default Users
