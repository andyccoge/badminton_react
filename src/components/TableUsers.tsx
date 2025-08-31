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
import AutorenewIcon from '@mui/icons-material/Autorenew';
import {Button} from '@mui/material';

import SearchFormModel, {
  MyChildRef as SearchFormModelMyChildRef
} from '../components/Model/SearchFormModel';

interface SearchForm {
  ids: any[];
  email: string | null;
  cellphone: string | null;
  gender: string | null;
  name_keyword: string | null;
  level_over: string | null;
  p: number;
  per_p_num: number;
}
export const empty_searchForm:SearchForm = {
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
  goSearch: () => void;
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
      // console.log(items);
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
    goSearch: async() => { await goSearch(); },
  }));

  const [rows, setRows] = React.useState<Array<any>>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(numPerPage>0 ? numPerPage : Number.MAX_VALUE);

  const handleChangePage = async (event: unknown, newPage: number) => {
    updateBodyBlock(true);
    setPage(newPage);
    let tempSerchform:any = SearchFormModelRef.current?.getFormData();
    tempSerchform['p'] = newPage;
    await getData(tempSerchform);
    updateBodyBlock(false);
  };
  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await setRowsPerPage(+event.target.value);
    let tempSerchform:any = SearchFormModelRef.current?.getFormData();
    tempSerchform['per_p_num'] = +event.target.value;
    console.log(tempSerchform);
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

  const SearchFormModelRef = React.useRef<SearchFormModelMyChildRef>(null);
  const goSearch = async () =>{
    updateBodyBlock(true);
    await setRows([]);
    await setPage(0);
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let tempSerchform:any = SearchFormModelRef.current?.getFormData();
    tempSerchform['p'] = 0;
    await getData(tempSerchform);
    updateBodyBlock(false);
  }

  return (<>
    {needSearch && <>
      <Button size="small" sx={{mr:'1rem',alignSelf:'center'}} 
              onClick={()=>{SearchFormModelRef.current?.setFormModel(true)}}>
        搜尋設定<SearchIcon />
      </Button>
      <Button size="small" sx={{alignSelf:'center'}} variant="text" color="info"
              onClick={()=>{goSearch()}}>
        <AutorenewIcon color={'inherit'} fontSize={'small'} className='cursor-pointer' />
      </Button>
      <Button size="small" sx={{alignSelf:'center'}} variant="text" color="info" 
              onClick={()=>{SearchFormModelRef.current?.cleanSearch()}}>
        清除篩選
      </Button>
      <SearchFormModel goSearch={goSearch}
        formData={JSON.parse(JSON.stringify(where))}
        formColumns={[
          {label:'姓名/綽號/LINE名稱', name:'name_keyword', type:'text', options:[],},
          {label:'等級(以上)', name:'level_over', type:'number', options:[], size:{xs:6}},
          {label:'手機', name:'cellphone', type:'text', options:[],},
          {label:'信箱', name:'email', type:'email', options:[],},
          {label:'性別', name:'gender', type:'select', options:[
            {text:'男', value:1},{text:'女', value:2},
          ], size:{xs:6}},
        ]}
        ref={SearchFormModelRef} />
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
                            <Button color="info" onClick={()=>{clickFirstCell(idx, row)}} sx={{p:0, display:'align', justifyContent:'start'}}>
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