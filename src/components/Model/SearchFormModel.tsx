import * as functions from '../../functions';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import {Box, Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import {TextField, Stack, Grid} from '@mui/material';
import {FormControl, InputLabel, MenuItem} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface optionType {
  text: string,
  value: any,
};
interface columnType {
  label: string,
  name: string,
  type: string,
  options?: Array<optionType>,
  size?: any,
};

export type MyChildRef = { // 子暴露方法給父
  setFormModel: (status:boolean) => void;
  getFormData: () => any;
  cleanSearch: () => void;
};
type MyChildProps = { // 父傳方法給子
  goSearch:() => void;
  formData: any,
  formColumns: Array<columnType>,
};

const SearchFormModel = React.forwardRef<MyChildRef, MyChildProps>((
  { goSearch,formData,formColumns }, ref
) => {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState(JSON.parse(JSON.stringify(formData)));
  const [columns, setColumns] = React.useState(JSON.parse(JSON.stringify(formColumns)));

  React.useImperativeHandle(ref, () => ({
    setFormModel: (status:boolean) => { setOpen(status); },
    getFormData: () => {
      let where = JSON.parse(JSON.stringify(form));
      if('ids' in where){ where['ids'] = JSON.stringify(where['ids']) }
      if('user_ids' in where){ where['user_ids'] = JSON.stringify(where['user_ids']) }
      return where;
    },
    cleanSearch: () => { handleCleanSearch(); },
  }));


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (event: SelectChangeEvent) => {
    let { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter'){ handleGoSearch(); }
  };

  const handleCleanSearch = async() => {
    setOpen(false);
    await setForm(formData);
    await goSearch();
  };
  const handleGoSearch = async() =>{
    await goSearch();
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        slots={{
          transition: functions.Transition,
        }}
        keepMounted
        onClose={()=>{setOpen(false)}}
        aria-describedby="搜尋參數設定跳出視窗"
      >
        <DialogTitle>{"搜尋參數設定"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {columns.map((column, idx) => {return (
              <Grid key={'search-'+idx} size={column.size?column.size:{xs:12, sm:6}}>
                {['select'].indexOf(column.type)!=-1 && <>
                  <FormControl variant="filled" size="small" sx={{ minWidth: 75 }} >
                    <InputLabel id={'serchFrom_'+column.name}>{column.label}</InputLabel>
                    <Select
                      labelId={'serchFrom_'+column.name}
                      name={column.name}
                      value={form[column.name]}
                      label={column.label}
                      onChange={handleSelectChange}
                      autoWidth
                    >
                      <MenuItem value={""}>無</MenuItem>
                      {column.options.map((option, idx2) => {return (
                        <MenuItem key={'search-'+idx+'-'+idx2} 
                                  value={option.value}
                          >{option.text}
                        </MenuItem>
                      )})}
                    </Select>
                  </FormControl>
                </>}
                {['select'].indexOf(column.type)==-1 && <>
                  <TextField fullWidth variant="filled" size="small" 
                            onChange={handleChange} onKeyDown={handleKeyDown}
                            label={column.label} type={column.type}
                            name={column.name} value={form[column.name]}/>
                </>}
              </Grid>
            )})}
          </Grid>
          <DialogContentText id="搜尋參數設定跳出視窗-說明">
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Stack direction={'row'} display={'flex'} justifyContent={'space-between'} className="w-full">
            <Button onClick={()=>{setOpen(false)}} size="small" color="secondary">關閉</Button>
            <Box>
              <Button onClick={handleCleanSearch} size="small" color="info" sx={{mr:'1rem'}}>清除篩選</Button>
              <Button onClick={handleGoSearch} size="medium" color="primary">搜尋</Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});
export default SearchFormModel;