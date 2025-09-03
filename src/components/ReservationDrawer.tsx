import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import Drawer from '@mui/material/Drawer';
import {Grid, Box, Stack, Typography, Button, Divider} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import {
  FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText, Switch
} from '@mui/material';

export interface ReservationsType {
  id: string,
  play_date_id: string,
  user_id: number,
  show_up: number,
  paid: number,
  leave: number,
}
const empty_data:ReservationsType = {
  id:'-1',
  play_date_id: '0',
  user_id: 0,
  show_up: 0,
  paid: 0,
  leave: 0,
}

export interface PlayReservationsType extends ReservationsType{
  name: string,
  name_nick: string,
  name_line: string,
  email: string,
  cellphone: number,
  gender: number,
  level: number,

  courtNum: number,
  waitNum: number,
  groupNumber: number,
}
const empty_data_play:PlayReservationsType = {
  ...empty_data,
  name: '',
  name_nick: '',
  name_line: '',
  email: '',
  cellphone: 0,
  gender: 0,
  level: 0,

  courtNum: 0,
  waitNum: 0,
  groupNumber: 0,
}

export type MyChildRef = { // 子暴露方法給父
  setModel: (idx, item, primaryKey?) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status:boolean) => void;
  reservations: PlayReservationsType[];
  setReservations: (items:any) => void;
  setUserModel?: (idx:number, item:any) => void;
};

const ReservationDrawer = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock,reservations,setReservations,setUserModel }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  // expose focus() method to parent
  React.useImperativeHandle(ref, () => ({
    setModel: (idx, item, primaryKey='id') => {
      setIndex(idx);
      setPrimaryId(item[primaryKey]);
      setOpen(true);
    },
  }));

  const [open, setOpen] = React.useState(false);
  const [primaryId, setPrimaryId] = React.useState(0);
  const [index, setIndex] = React.useState(-1);
  const [reservation, change] = React.useState<PlayReservationsType>({} as PlayReservationsType);
  React.useEffect(() => {
    change( (index>0&&index<reservations.length)?reservations[index]:{} as PlayReservationsType)
  }, [index]);
  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let saveData = null;
    setReservations(prev => (
      prev.map((xx, xidx) => {
        if(index==xidx || index==-1){
          saveData = { ...xx, [event.target.name]: event.target.checked? 1:0, };
          return saveData;
        }
        return xx;
      })
    ));
    handleSave(saveData);
  };


  const handleSave = async (data:any) =>{
      if(!data){ return; }
      updateBodyBlock(true); //顯示遮蓋
      // console.log(form);
      let result:any = null;
      try {
        let saveData = Object.keys(empty_data).reduce(
          (acc, key) => {
            acc[key] = data.hasOwnProperty(key) ? data[key] : empty_data[key];
            return acc;
          },
          {}
        );
        // console.log(data)
        result = await functions.fetchData('PUT', 'reservations', saveData, {id:primaryId});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          setOpen(false);
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('發生錯誤', 'error');
      }
      updateBodyBlock(false); //隱藏遮蓋
    }

  return (
    <Drawer open={open} onClose={()=>{setOpen(false)}}>
      <Box p={'10px'}>
        <Typography variant='h6'>{'球員資料'}</Typography>
        <Divider sx={{m:'10px 0'}}/>
        <Stack>
          <Typography variant='subtitle1'>
            <b>{reservation.name}</b>
            {reservation.gender ? (reservation.gender==1?'♂️':'♀️') : '❔'}
          </Typography>
          <Typography variant='body2'>綽號:{reservation.name_nick}</Typography>
          <Typography variant='body2'>LINE名稱:{reservation.name_line}</Typography>
          <Typography variant='body2'>Email:{reservation.email}</Typography>
          <Typography variant='body2'>手機:{reservation.cellphone}</Typography>
          <Typography variant='body2'>
            <em>⭐:</em>{reservation.level}&nbsp;&nbsp;{/* 等級 */}
            <em>🎌:</em>{reservation.courtNum || 0}&nbsp;&nbsp;{/* 比賽場數 */}
            <em>💤:</em>{reservation.waitNum || 0}{/* 等待 */}
          </Typography>
          <Box textAlign={'center'} sx={{mt:'10px'}}>
            <Button size='small' onClick={()=>{if(setUserModel){setUserModel(index, reservation)}}}>
              編輯資料 <EditSquareIcon />
            </Button>
          </Box>
          <Divider sx={{m:'10px 0'}}/>
          <Grid container>
            <Grid size={12}>
              <Typography variant='subtitle1'>{'報名狀態'}</Typography>
            </Grid>
            <FormControl variant="standard">
              <FormGroup>
                <FormControlLabel label="報到" control={
                  <Switch checked={Boolean(reservation.show_up)} name="show_up" size='small' onChange={handleSwitch}/>
                }/>
                <FormControlLabel label="付款" control={
                  <Switch checked={Boolean(reservation.paid)} name="paid" size='small' onChange={handleSwitch}/>
                }/>
                {/* <FormControlLabel label="離場" control={
                  <Switch checked={Boolean(reservation.leave)} name="leave" size='small' onChange={handleSwitch}/>
                }/> */}
              </FormGroup>
            </FormControl>
          </Grid>
        </Stack>
      </Box>
    </Drawer>
  );
});
export default ReservationDrawer;