import * as functions from '../../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import {TextField, Stack, Grid} from '@mui/material';

import {FormControl, InputLabel, MenuItem} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  "play_date_id": 0,
  "code": "",
  "type": 1
}
const CourtModel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock,reGetList,renewList }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

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
        result = await functions.fetchData('POST', 'courts', form);
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await reGetList();
          setOpen(false);
        }
      }else{ // 編輯
        result = await functions.fetchData('PUT', 'courts', form, {id:primaryId});
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
          transition: Transition,
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"場地資料"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:12}}>
              <Stack direction={{xs:"column", md:"row"}} spacing={2}>
                <TextField fullWidth variant="filled" size="small"
                        onChange={handleChange} onKeyDown={handleKeyDown} 
                        label="編號" name="code" value={form.code}/>
                <FormControl variant="filled" size="small" sx={{ minWidth: 80 }} >
                  <InputLabel id="courtForm_type">類型</InputLabel>
                  <Select
                    labelId="courtForm_type"
                    name="type"
                    value={form.type}
                    onChange={handleSelectChange}
                    autoWidth
                    label="類型"
                  >
                    <MenuItem value={1}>比賽</MenuItem>
                    <MenuItem value={2}>預備</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
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
export default CourtModel;