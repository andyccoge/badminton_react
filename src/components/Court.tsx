import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';

import { Box, Grid, Stack, Typography, Button} from '@mui/material';
import {Card, CardActionArea, CardContent, CardMedia, CardActions} from '@mui/material';
import EditSquareIcon from '@mui/icons-material/EditSquare';

import UserNameCard, {MyChildRef as UserNameCardMyChildRef, userType} from '../components/UserNameCard';

export type MyChildRef = { // 子暴露方法給父
  getUserNameCards: () => Array<React.RefObject<UserNameCardMyChildRef | null>>;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  court_idx: number,
  court:{id:number,code:string,type:number}
  user_1_idx?: number,
  user_1?:userType | null,
  user_2_idx?: number,
  user_2?:userType | null,
  user_3_idx?: number,
  user_3?:userType | null,
  user_4_idx?: number,
  user_4?:userType | null,
  vertical?: boolean,
  clickUserName: (refIdx:number) => void;
};

function Court(
  { 
    updateBodyBlock, court_idx, court,
    user_1_idx=-1, user_1=null,
    user_2_idx=-1, user_2=null,
    user_3_idx=-1, user_3=null,
    user_4_idx=-1, user_4=null,
    clickUserName, vertical=false,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  React.useImperativeHandle(ref, () => ({
    getUserNameCards: () => { return [
      UserNameCardRef1,
      UserNameCardRef2,
      UserNameCardRef3,
      UserNameCardRef4,
    ]; },
  }));

  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const UserNameCardRef1 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef2 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef3 = React.useRef<UserNameCardMyChildRef>(null);
  const UserNameCardRef4 = React.useRef<UserNameCardMyChildRef>(null);

  return (<>
    <Box position={'relative'}>
      <Card sx={{ 
        maxWidth: 345,
        backgroundSize: '100% 100%',
        bgcolor:(court && court.type==1)?'#00ee88':'#ffdd44',
        backgroundImage: "url(/src/img/"+(vertical?"badminton_court_v_e.png":"badminton_court_e.png")+")",
      }}>
        <CardContent style={{padding:0,}}>
          <Grid container spacing={1} padding={vertical?'5px 10px':'10px 0'}
                alignItems={'center'} justifyContent={'center'}>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1}
                    justifyContent={'space-around'} alignItems={'center'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={user_1_idx}
                              user={user_1}
                              vertical={vertical}
                              onClick={()=>{clickUserName(0)}}
                              ref={UserNameCardRef1}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={user_2_idx}
                              user={user_2}
                              vertical={vertical}
                              onClick={()=>{clickUserName(1)}}
                              ref={UserNameCardRef2}
                ></UserNameCard>
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 2, md:1}} 
                  display={'flex'} justifyContent={'center'}>
              <Stack direction={vertical?'row':'column'} display={'flex'} alignItems={'center'}>
                <Typography sx={{pr:vertical?'0.5rem':0,}}>
                  {court && court.code}
                </Typography>
                <EditSquareIcon />
              </Stack>
            </Grid>
            <Grid size={vertical?{xs:12}:{ xs: 4, md:5}}>
              <Stack direction={vertical?'row':'column'} spacing={1}
                    justifyContent={'space-around'} alignItems={'center'}>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={user_3_idx}
                              user={user_3}
                              vertical={vertical}
                              onClick={()=>{clickUserName(2)}}
                              ref={UserNameCardRef3}
                ></UserNameCard>
                <UserNameCard updateBodyBlock={updateBodyBlock}
                              user_idx={user_4_idx}
                              user={user_4}
                              vertical={vertical}
                              onClick={()=>{clickUserName(3)}}
                              ref={UserNameCardRef4}
                ></UserNameCard>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
    <Box>
    </Box>
  </>)
}
export default React.forwardRef<MyChildRef, MyChildProps>(Court);