import * as functions from '../functions.tsx'
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
  setModel: (idx, item) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status) => void;
  reGetList: (where:any) => void;
  renewList: (idx, item) => void;
};

const empty_data = {
  "id":-1,
  "name":'',
  "name_line":'',
  "name_nick":'',
  "email":'',
  "cellphone":'',
  "gender":1,
  "level":0,
}
const UserModel = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock,reGetList,renewList }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

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

  // expose focus() method to parent
  React.useImperativeHandle(ref, () => ({
    setModel: (idx, item) => {
      let data = Object.keys(empty_data).reduce(
        (acc, key) => {
          acc[key] = item.hasOwnProperty(key) ? item[key] : empty_data[key];
          return acc;
        },
        {}
      );
      // console.log(data)
      setIndex(idx)
      setForm(data)
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
        result = await functions.fetchData('POST', 'users', form);
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await reGetList(null);
          setOpen(false);
        }
      }else{ // 編輯
        result = await functions.fetchData('PUT', 'users', form, {id:form.id});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          await renewList(index, form);
          setOpen(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const data = error?.response?.data;
      if (typeof data === 'string' && data.match('email_cellphone_UNIQUE')) {
        showMessage('信箱與手機同時與其人的資料重複', 'error');
      }
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
        <DialogTitle>{"球員資料"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="姓名" name="name" value={form.name}/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="LINE名稱" name="name_line" value={form.name_line}/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="綽號" name="name_nick" value={form.name_nick}/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="信箱" name="email" value={form.email} type="email"/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="手機" name="cellphone" value={form.cellphone}/>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <Stack direction={{xs:"column", md:"row"}} spacing={2}>
                <TextField fullWidth variant="filled" size="small" onChange={handleChange} label="等級" name="level" value={form.level} type="number"/>
                <FormControl variant="filled" size="small" sx={{ minWidth: 75 }} >
                  <InputLabel id="userForm_gender">性別</InputLabel>
                  <Select
                    labelId="userForm_gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleSelectChange}
                    autoWidth
                    label="性別"
                  >
                    <MenuItem value={1}>男</MenuItem>
                    <MenuItem value={2}>女</MenuItem>
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
export default UserModel;