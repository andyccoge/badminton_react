import * as React from 'react';
import {Drawer, Grid} from '@mui/material';
import {Box, Divider} from '@mui/material';

import UserNameCard, {MyChildRef as UserNameCardMyChildRef, userType} from '../../components/UserNameCard';

export type MyChildRef = { // 子暴露方法給父
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: () => void;
  open: boolean;
  onClose: () => void;
  users?:userType[];
  doSelectUser?: (userIdx:number) => void;
};

const UserPanel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock, open, onClose, users=[], doSelectUser }, ref
) => {
  const NameRefs = React.useRef<Array<React.RefObject<UserNameCardMyChildRef | null>>>([]);
  const handleNameRefs = (index: number) => (el: UserNameCardMyChildRef | null) => {
    if (el) {
      NameRefs.current[index] = { current: el };
    } else {
      NameRefs.current[index] = { current: null };
    }
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box role="presentation" p={'0.5rem 0.5rem'}>
        <Divider sx={{mb:'0.5rem'}}/>
        <Grid container flexWrap={'wrap'} spacing={1}>
          {users.map((user,idx)=>(
            <UserNameCard key={'user_panel-'+idx}
              updateBodyBlock={updateBodyBlock}
              user_idx={idx}
              user={user}
              onClick={()=>{ if(doSelectUser){doSelectUser(idx)} }}
              ref={handleNameRefs(idx)}
            ></UserNameCard>
          ))}
        </Grid>
      </Box>
    </Drawer>
  );
})
export default UserPanel;