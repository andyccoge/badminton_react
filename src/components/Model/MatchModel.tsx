import * as functions from '../../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import {TextField, Stack, Grid, Divider} from '@mui/material';

import {FormControl, InputLabel, MenuItem} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {UserType} from '../../components/UserNameCard';

export type MyChildRef = { // 子暴露方法給父
  setModel: (idx, item, primaryKey?) => void;
  setUserMap:(map:{[key: string]: UserType}) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status) => void;
  reGetList: () => void;
  renewList: (idx, item) => void;
};

const empty_data = {
  "id":-1,
  "user_id_1":0,
  "user_id_2":0,
  "user_id_3":0,
  "user_id_4":0,
  "play_date_id":0,
  "court_id":0,
  "point_12":0,
  "point_34":0,
  "duration":0,
}
const MatchModel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock, reGetList, renewList, }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [userIdMap, setUserIdMap] = React.useState<{[key: string]: UserType}>({});

  const [primaryId, setPrimaryId] = React.useState(0);
  const [index, setIndex] = React.useState(-1);
  const [form, setForm] = React.useState(JSON.parse(JSON.stringify(empty_data)));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (event: SelectChangeEvent) => {
    let { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleKeyDown = async(event) => {
    if (event.key === 'Enter'){ handleSave(); }
  };

  // expose focus() method to parent
  React.useImperativeHandle(ref, () => ({
    setModel: (idx, item, primaryKey='id') => {
      let data = Object.keys(empty_data).reduce(
        (acc, key) => {
          acc[key] = item.hasOwnProperty(key) ? item[key] : empty_data[key];
          return acc;
        },
        {}
      );
      // console.log(data)
      setIndex(idx);
      setForm(data);
      setPrimaryId(item[primaryKey]);
      setOpen(true);
    },
    setUserMap:(map) => { setUserIdMap(map); },
  }));

  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = async () =>{
    updateBodyBlock(true); //顯示遮蓋
    // console.log(form);
    let result:any = null;
    try {
      if(form.id==-1){ // 新增
        result = await functions.fetchData('POST', 'matchs', form);
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await reGetList();
          setOpen(false);
        }
      }else{ // 編輯
        result = await functions.fetchData('PUT', 'matchs', form, {id:primaryId});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await renewList(index, form);
          setOpen(false);
        }
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('發生錯誤', 'error');
    }
    updateBodyBlock(false); //隱藏遮蓋
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        slots={{
          transition: functions.Transition,
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"比賽資料"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6}}>
              隊伍1：<br />
              <b>{
                [
                  userIdMap[form.user_id_1] && userIdMap[form.user_id_1].name,
                  userIdMap[form.user_id_2] && userIdMap[form.user_id_2].name
                ].filter((has)=>{return has}).join('、') || '(無球員)'
              }</b>
              <TextField fullWidth variant="filled" size="small" type="number"
                        onChange={handleChange} onKeyDown={handleKeyDown} 
                        label="隊伍1比數" name="point_12" value={form.point_12}/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              隊伍2：<br />
              <b>{
                [
                  userIdMap[form.user_id_3] && userIdMap[form.user_id_3].name,
                  userIdMap[form.user_id_4] && userIdMap[form.user_id_4].name
                ].filter((has)=>{return has}).join('、') || '(無球員)'
              }</b>
              <TextField fullWidth variant="filled" size="small" type="number"
                        onChange={handleChange} onKeyDown={handleKeyDown} 
                        label="隊伍2比數" name="point_34" value={form.point_34}/>
            </Grid>
            <Grid size={{xs:12}}><Divider sx={{marginBottom:'1rem'}}/></Grid>
            <Grid size={{xs:12}}>
              <TextField fullWidth variant="filled" size="small" type="number"
                        onChange={handleChange} onKeyDown={handleKeyDown} 
                        label="比賽用時(秒)" name="duration" value={form.duration}/>
            </Grid>
          </Grid>
          <DialogContentText id="alert-dialog-slide-description">
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} size="small" color="secondary">取消</Button>
          <Button onClick={handleSave} size="medium" color="primary">儲存</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});
export default MatchModel;