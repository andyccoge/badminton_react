import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';

import { Box, Grid, Stack, Typography, Button} from '@mui/material';
import {Card, CardActionArea, CardContent, CardMedia, CardActions} from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

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


export interface userType {
  id: string,
  idx: number,
  name: string,
  name_nick: string,
  level: number,
  gender: number,
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
  user?: userType | null,
  vertical?: boolean,
  onClick: () => void;
};

function UserNameCard(
  { 
    updateBodyBlock, user_idx, user, vertical=true, onClick,
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
        border: selectedStatus ? '3px solid #ff0000' : '1px solid #000',
        boxShadow: selectedStatus ? '0px 0px 10px 5px #ff0000' : null,
        bgcolor: user?.gender==2 ? '#ff7788' : '#00aaff',
      }}
      onClick={()=>{onClick()}}
    >
      <CardContent style={{padding:0, width:'100%'}}>
        <HtmlTooltip
          title={
            <React.Fragment>
              <em>綽號：</em>{user?.name_nick}<br/>
              <em>等級：</em>{user?.level}
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
        >
          <Box sx={{maxHeight: vertical ? '4.5rem' : '5rem',}}>
            <Typography variant='body1' sx={{wordBreak: 'break-all',}} display={'inline-block'}>
              {functions.middleEllipsis(user?.name)}
              {/* {functions.middleEllipsis('JerryPan Wuuu', 12)} */}
              {/* {functions.middleEllipsis('陳彥彥彥彥彥彥彥安', 5)} */}
            </Typography>
            <Typography variant='body1' sx={{wordBreak: 'break-all',}} display={'inline-block'}>
              (場:{user?.courtNum || 0})
            </Typography>
          </Box>
        </HtmlTooltip>
      </CardContent>
    </Card>
  </>)
}
export default React.forwardRef<MyChildRef, MyChildProps>(UserNameCard);
