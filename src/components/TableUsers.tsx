import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';

import SearchIcon from '@mui/icons-material/Search';
import {TextField, Stack, Button} from '@mui/material';
import {FormControl, InputLabel, MenuItem} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const empty_searchForm = {
  ids:[],
  email: '',
  cellphone: '',
  gender: '',
  name_keyword: '',
  level_over: '',
  p: 0,
  per_p_num: 0,
};

interface Column {
  id: 'name' | 'name_nick' | 'name_line' | 'gender' | 'level' | 'cellphone' | 'email';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'name', label: '姓名', minWidth: 100 },
  { id: 'name_nick', label: '綽號', minWidth: 100 },
  { id: 'name_line', label: 'LINE名稱', minWidth: 100 },
  { 
    id: 'gender', 
    label: '性別', 
    minWidth: 62,
    format: (value: number) => ['', '男', '女'][value]
  },
  { id: 'level', label: '等級', minWidth: 62 },
  { id: 'cellphone', label: '手機', minWidth: 100 },
  { id: 'email', label: '信箱', minWidth: 150 },
];

interface Data {
  id:number,
  name:string,
  name_line:string,
  name_nick:string,
  email:string,
  cellphone:string,
  gender:number,
  level:number,
}


export type MyChildRef = { // 子暴露方法給父
  showRows: (items:Array<Data>) => void;
  getSelectedIds: () => readonly number[];
  resetSelect: () => void;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  getData: (where:any) => void;
  clickFirstCell:(idx:number, item:any) => void;
  countTotal?: number;
  where?: {},
  numPerPage?: number,
  needSearch?: boolean,
  needCheckBox?: boolean,
  needTool?: boolean,
};
function TableUsers(
  { 
    updateBodyBlock, getData, clickFirstCell, where={}, countTotal=0, 
    numPerPage=10, needSearch=true, needCheckBox=false, needTool=false,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  React.useImperativeHandle(ref, () => ({
    showRows: (items:Array<Data>) => {
      items = items.map((row) => {
        /*處理資料*/
        return row;
      })
      setRows(items)
    },
    getSelectedIds: ():readonly number[] => {
      return selected;
    },
    resetSelect: () => {
      setSelected([]);
    },
  }));

  const [rows, setRows] = React.useState<Array<any>>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(numPerPage>0 ? numPerPage : Number.MAX_VALUE);
  const [serchform, setSearchForm] = React.useState(JSON.parse(JSON.stringify(where)));

  const handleChangePage = async (event: unknown, newPage: number) => {
    updateBodyBlock(true);
    setPage(newPage);
    serchform['p'] = newPage;
    setSearchForm(serchform);
    await getData(serchform);
    updateBodyBlock(false);
  };
  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    serchform['per_p_num'] = +event.target.value;
    setSearchForm(serchform);
    console.log(serchform);
    await goSearch();
  };

  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };
  const handleKeyDown = async(event) => {
    if (event.key === 'Enter'){ await goSearch(); }
  };
  const handleSelectChange = (event: SelectChangeEvent) => {
    let { name, value } = event.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };
  const goSearch = async () =>{
    updateBodyBlock(true);
    setRows([]);
    setPage(0);
    serchform['p'] = 0;
    await getData(serchform);
    updateBodyBlock(false);
  }
  const cleanSearch = async () =>{
    setSearchForm(where);
    await goSearch();
  }

  return (<>
    {needSearch && <>
      <Stack direction={"row"} spacing={0} flexWrap={'wrap'} justifyContent={'start'}>
        <TextField variant="filled" size="small" onChange={handleChange} onKeyDown={handleKeyDown} label="信箱" name="email" value={serchform.email}/>
        <TextField variant="filled" size="small" onChange={handleChange} onKeyDown={handleKeyDown} label="手機" name="cellphone" value={serchform.cellphone}/>
        <TextField variant="filled" size="small" onChange={handleChange} onKeyDown={handleKeyDown} label="姓名/綽號/LINE名稱" name="name_keyword" value={serchform.name_keyword}/>
        <TextField variant="filled" size="small" onChange={handleChange} onKeyDown={handleKeyDown} label="等級(以上)" name="level_over" value={serchform.level_over} type="number"/>
        <FormControl variant="filled" size="small" sx={{ minWidth: 75 }} >
          <InputLabel id="searchform_gender">性別</InputLabel>
          <Select
            labelId="searchform_gender"
            name="gender"
            value={serchform.gender}
            onChange={handleSelectChange}
            autoWidth
            label="性別"
          >
            <MenuItem value=""><em></em></MenuItem>
            <MenuItem value={1}>男</MenuItem>
            <MenuItem value={2}>女</MenuItem>
          </Select>
        </FormControl>
        <Button size="small" sx={{mr:'1rem',alignSelf:'center'}} onClick={goSearch}>
          搜尋<SearchIcon />
        </Button>
        <Button size="small" sx={{alignSelf:'center'}} variant="text" color="info" onClick={cleanSearch}>
          清除搜尋
        </Button>
      </Stack>
    </>}
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            {/* 
              <TableRow>
                <TableCell align="center" colSpan={2}>跨欄1,2</TableCell>
                <TableCell align="center" colSpan={3}>跨欄3,4,5</TableCell>
              </TableRow> 
            */}
            <TableRow>
              {needCheckBox &&
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': '全選',
                    }}
                  />
                </TableCell>
               }
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 0, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {needCheckBox &&
                      <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(event) => handleClick(event, row.id)}
                          color="primary"
                          checked={selected.includes(row.id)}
                          inputProps={{
                            'aria-labelledby': row.id,
                          }}
                        />
                      </TableCell>
                    }
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {index==0 && <>
                            <Button color="info" onClick={()=>{clickFirstCell(idx, row)}} sx={{p:0}}>
                              {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                            </Button>
                          </>}
                          {index!=0 && <>
                            {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                          </>}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination sx={{display:numPerPage<=0 ? 'none' : 'block'}}
        rowsPerPageOptions={[...new Set([10, 25, 100, rowsPerPage])].sort((a, b) => a - b)}
        component="div"
        count={countTotal}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="一頁顯示："
        labelDisplayedRows={({ from, to, count })=>{ return `${from}–${to} / ${count !== -1 ? count : `超過 ${to}`}`; }}
      />
    </Paper>
  </>);
}
export default React.forwardRef<MyChildRef, MyChildProps>(TableUsers);