import * as React from 'react';
import {Grid} from '@mui/material';
import {Box, Divider,} from '@mui/material';
import {Card, CardContent,Typography} from '@mui/material';
import { grey } from '@mui/material/colors';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import UserNameCard, {MyChildRef as UserNameCardMyChildRef, UserType} from '../../components/UserNameCard';

export type MyChildRef = { // 子暴露方法給父
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status:boolean) => void;
  users?:UserType[];
  doSelectUser?: (userIdx:number) => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  userIdxMatch?:number[];
  userIdxMatchCode?:{};
  userIdxPrepare?:number[];
  setUserModel?: (idx:number, item:any) => void;
  setUserDrawer?: (idx:number, item:any) => void;
};

const UserPanel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock, users=[], 
    doSelectUser, setUserShowUp, setUserLeave, userIdxMatch=[], userIdxMatchCode={}, userIdxPrepare=[],
    setUserModel, setUserDrawer,
  }, ref
) => {
  const NameRefs = React.useRef<Array<React.RefObject<UserNameCardMyChildRef | null>>>([]);
  const handleNameRefs = (index: number) => (el: UserNameCardMyChildRef | null) => {
    if (el) {
      NameRefs.current[index] = { current: el };
    } else {
      NameRefs.current[index] = { current: null };
    }
  };

  return (<>
      <Box role="presentation" p={'0.25rem 0.25rem'} maxHeight={'65vh'} overflow={'scroll'}>
        <Divider sx={{mb:'0.5rem'}}/>
        <Grid container flexWrap={'wrap'} spacing={0.5}>
          <Card sx={{ 
              width: 80, 
              maxheight: '4.5rem',
              display:'flex', alignItems:'center', justifyContent:'center',
              border: '1px solid #000',
              bgcolor: grey[400],
            }}
          >
            <CardContent style={{padding:0}} className='cursor-pointer' onClick={()=>{ if(doSelectUser){doSelectUser(-1)} }}>
              <Typography textAlign={'center'}>取消 <DeleteForeverIcon/></Typography>
            </CardContent>
          </Card>
          {users.map((user,idx)=>(
            <UserNameCard key={'user_panel-'+idx}
              updateBodyBlock={updateBodyBlock}
              user_idx={idx}
              user={user}
              showGender={true}
              onClick={()=>{ if(doSelectUser){doSelectUser(idx)} }}
              setUserShowUp={setUserShowUp}
              setUserLeave={setUserLeave}
              userIdxMatch={userIdxMatch}
              userIdxPrepare={userIdxPrepare}
              matchCourtCode={userIdxMatchCode[idx]??''}
              setUserModel={setUserModel}
              setUserDrawer={setUserDrawer}
              ref={handleNameRefs(idx)}
            ></UserNameCard>
          ))}
        </Grid>
      </Box>
  </>);
})
export default UserPanel;