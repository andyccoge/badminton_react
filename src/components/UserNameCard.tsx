import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';

import { Box, Grid, Stack, Typography, Button} from '@mui/material';
import {Card, CardActionArea, CardContent, CardMedia, CardActions} from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));


export interface UserType {
  id: string,
  name: string,
  name_nick: string,
  name_line: string,
  level: number,
  gender: number,
  show_up: number,
  waitNum: number,
  courtNum: number,
  groupNumber: number,
}

export type MyChildRef = { // 子暴露方法給父
  setSelectedStatus: (status) => void;
  toggleSelectedStatus: () => void;
  getSelectedStatus: () => boolean;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  user_idx: number,
  user?: UserType | null,
  vertical?: boolean,
  onClick: () => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  userIdxMatch?:number[],
};

function UserNameCard(
  { 
    updateBodyBlock, user_idx, user, vertical=true, onClick, 
    setUserShowUp, setUserLeave, userIdxMatch=[]
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  React.useImperativeHandle(ref, () => ({
    setSelectedStatus: async(status) => { await setSelectedStatus(status); },
    toggleSelectedStatus: async() => { await toggleSelectedStatus(); },
    getSelectedStatus: () => { return selectedStatus; }
  }));

  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [selectedStatus, setSelectedStatus] = React.useState(false);
  const toggleSelectedStatus = async() => { 
    await setSelectedStatus(selectedStatus?false:true);
  }

  return (<>
    <Card sx={{ 
        width: vertical ? 100: 50, 
        minHeight: '2.4rem',
        maxheight: vertical ? '4.5rem' : '5rem', 
        display:'flex', alignItems:'center', justifyContent:'center',
        border: '1px solid #000',
        boxShadow: selectedStatus ? '0px 0px 3px 5px #ff0000' : null,
        bgcolor: '',
        opacity: user?.show_up==0 ? 0.5 : 1,
      }}
    >
      <HtmlTooltip
        title={
          <React.Fragment>
            {user?.name_nick}{/* 綽號 */}
            /
            {user?.name_line}{/* LINE名稱 */}
            {/* {user?.gender ? (user?.gender==1?'♂️':'♀️') : '❔'} */}
            <br/>
            <em>⭐:</em>{user?.level || 0}&nbsp;&nbsp;{/* 等級 */}
            <em>🎌:</em>{user?.courtNum || 0}&nbsp;&nbsp;{/* 比賽場數 */}
            <em>💤:</em>{user?.waitNum || 0}{/* 等待 */}
            {user?.id && <Grid container spacing={2}> 
              <Grid size={3} textAlign={'center'}>
                <EmojiPeopleIcon className='cursor-pointer' fontSize={'small'}
                  onClick={()=>{if(setUserShowUp){setUserShowUp(user_idx)}}}/>
              </Grid>
              <Grid size={3} textAlign={'center'}>
                <VisibilityIcon className='cursor-pointer' fontSize={'small'}
                  onClick={()=>{alert('view'+user?.id+':'+user_idx)}}/>
              </Grid>
              <Grid size={3} textAlign={'center'}>
                <EditSquareIcon className='cursor-pointer' fontSize={'small'} 
                  onClick={()=>{alert('edit'+user?.id+':'+user_idx)}}/>
              </Grid>
              <Grid size={3} textAlign={'center'}>
                <DirectionsWalkIcon className='cursor-pointer' fontSize={'small'}
                  onClick={()=>{if(setUserLeave){setUserLeave(user_idx)}}}/>
              </Grid>
            </Grid>}
          </React.Fragment>
        }
        arrow
        slotProps={{
          popper: {
            modifiers: [
              { name: 'offset', options: { offset: [0, -14], }, },
            ],
          },
        }}
        sx={{display:user_idx==-1?'none':'block',}}
      >
        <CardContent style={{padding:0}} className='cursor-pointer' onClick={()=>{onClick()}}
                     sx={{
                      maxHeight: vertical ? '4.5rem' : '5rem',
                      opacity: userIdxMatch.indexOf(user_idx)==-1 ? '1' : '0.25'
                    }}>
          <Typography variant='body2' sx={{wordBreak: 'break-all',}} display={'inline-block'}>
            {functions.middleEllipsis(user?.name, 5) || '(空)'}
            {user?.gender ? (user?.gender==1?'♂️':'♀️') : '❔'}
          </Typography>
          <Typography variant='caption' sx={{wordBreak: 'break-all',}} display={'inline-flex'} lineHeight={1}>
            <em className='inline-block'>⭐<em className='inline-block'>{user?.level || 0}</em></em>
            <em className='inline-block'>🎌<em className='inline-block'>{user?.courtNum || 0}</em></em>
            <em className='inline-block'>💤<em className='inline-block'>{user?.waitNum || 0}</em></em>
          </Typography>
        </CardContent>
      </HtmlTooltip>
    </Card>
  </>)
}
export default React.forwardRef<MyChildRef, MyChildProps>(UserNameCard);
