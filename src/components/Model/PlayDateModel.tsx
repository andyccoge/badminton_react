import * as functions from '../../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import {TextField, Stack, Grid} from '@mui/material';

export type MyChildRef = { // 子暴露方法給父
  setModel: (idx, item, primaryKey?) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status) => void;
  reGetList: () => void;
  renewList: (idx, item) => void;
};

const empty_data = {
  "id":-1,
  "datetime":" ",
  "datetime2":" ",
  "location":"",
  "note":"",
}
const PlayDateModel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock,reGetList,renewList }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [primaryId, setPrimaryId] = React.useState(0);
  const [index, setIndex] = React.useState(-1);
  const [form, setForm] = React.useState(JSON.parse(JSON.stringify(empty_data)));
  const handleChange_sd = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    let { value } = e.target;
    if(value){
      setForm(prev => ({ ...prev, ['datetime2']: (value + ' ' + form.datetime2.split(' ')[1]) }));
    }
  }
  const handleChange_st = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    let { value } = e.target;
    if(value){
      setForm(prev => ({ ...prev, ['datetime2']: (form.datetime2.split(' ')[0] + ' ' + value) }));
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if(name=='datetime_d'){ name='datetime'; value = value + ' ' + form.datetime.split(' ')[1];}
    if(name=='datetime_t'){ name='datetime'; value = form.datetime.split(' ')[0] + ' ' + value;}
    if(name=='datetime2_d'){ name='datetime2'; value = value + ' ' + form.datetime2.split(' ')[1];}
    if(name=='datetime2_t'){ name='datetime2'; value = form.datetime2.split(' ')[0] + ' ' + value;}
    setForm(prev => ({ ...prev, [name]: value }));
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
        result = await functions.fetchData('POST', 'play_date', form);
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await reGetList();
          setOpen(false);
        }
      }else{ // 編輯
        result = await functions.fetchData('PUT', 'play_date', form, {id:primaryId});
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
        <DialogTitle>{"打球日設定"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <Stack direction={{xs:"column", md:"row"}} spacing={{xs:0, md:0}}>
                  <TextField fullWidth variant="filled" size="small" onChange={handleChange_sd} label="開始日期" name="datetime_d" value={form.datetime.split(' ')[0]} type="date"/>
                  <TextField fullWidth variant="filled" size="small" onChange={handleChange_st} label="開始時間" name="datetime_t" value={form.datetime.split(' ')[1]} type="time"/>
                </Stack>
              </Grid>
              <Grid size={{xs:12}}>
                <Stack direction={{xs:"column", md:"row"}} spacing={{xs:0, md:0}}>
                  <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="結束日期" name="datetime2_d" value={form.datetime2.split(' ')[0]} type="date"/>
                  <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="結束時間" name="datetime2_t" value={form.datetime2.split(' ')[1]} type="time"/>
                </Stack>
              </Grid>
            </Grid>
            <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="地點" name="location" value={form.location}/>
            <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="備註" name="note" value={form.note}/>
          </Stack>
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
export default PlayDateModel;