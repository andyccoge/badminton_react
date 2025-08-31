import * as functions from '../functions.tsx'
import * as React from 'react';
import { useSnackbar } from 'notistack';

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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {Box, Button} from '@mui/material';
import { Link } from 'react-router-dom';


import SearchFormModel, {
  MyChildRef as SearchFormModelMyChildRef
} from '../components/Model/SearchFormModel';
import MatchModel, {MyChildRef as MatchModelMyChildRef} from '../components/Model/MatchModel';

interface SearchForm {
  ids: any[];
  play_date_id: string | null;
  name_keyword: string | null;
  p: number;
  per_p_num: number;
}
export const empty_searchForm:SearchForm = {
  ids:[],
  play_date_id:'',
  name_keyword:'',
  p: 0,
  per_p_num: 0,
};

interface Column {
  id: 'user_id_1' | 'user_id_2' | 'point_12' | 'point_34' | 'user_id_3' | 'user_id_4' | 'duration';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: number) => string;
}

export interface Data {
  id:number,
  user_id_1:number | null,
  user_id_2:number | null,
  user_id_3:number | null,
  user_id_4:number | null,
  play_date_id:number,
  court_id:number,
  point_12:number,
  point_34:number,
  duration:number,
}


export type MyChildRef = { // 子暴露方法給父
  setPlayMatchs:(result:{matchs:Data[]; user_map:any}) => void;
  showRows: (items:Array<Data>) => void;
  getRows: () => Array<Data>;
  getSelectedIds: () => readonly number[];
  resetSelect: () => void;
  goSearch: () => void;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status) => void;
  showConfirmModelStatus: (
    title: string,
    message: string,
    do_function_name?: string,
    do_function?: ()=> Promise<boolean>,
  ) => void;
  countTotal?: number;
  where?: {},
  numPerPage?: number,
  needSearch?: boolean,
  needCheckBox?: boolean,
  needTool?: boolean,
};
function TableMatchs(
  { 
    updateBodyBlock, showConfirmModelStatus, where={}, countTotal=0, 
    numPerPage=10, needSearch=true, needCheckBox=false, needTool=false,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  React.useImperativeHandle(ref, () => ({
    showRows: (items:Array<Data>) => { showRows(items); },
    getRows: () => { return rows; },
    getSelectedIds: ():readonly number[] => {
      return selected;
    },
    resetSelect: () => { setSelected([]); },
    goSearch: async() => { await goSearch(); },
    setPlayMatchs:(result:{matchs:Data[]; user_map:any}) => {
      setUserIdMap({ ...userIdMap, ...result.user_map});
      showRows(result.matchs);
    }
  }));

  const [userIdMap, setUserIdMap] = React.useState<any>({})
  const columns: Column[] = [
    { id: 'user_id_1', label: '球員1', minWidth: 100, align:'center',
      format: (value: number) => userIdMap[value].name
    },
    { id: 'user_id_2', label: '球員2', minWidth: 100, align:'center',
      format: (value: number) => userIdMap[value].name
    },
    { id: 'point_12', label: '比數1', minWidth: 100, align:'center',},
    { id: 'point_34', label: '比數2', minWidth: 100, align:'center',},
    { id: 'user_id_3', label: '球員3', minWidth: 100, align:'center',
      format: (value: number) => userIdMap[value].name
    },
    { id: 'user_id_4', label: '球員4', minWidth: 100, align:'center',
      format: (value: number) => userIdMap[value].name
    },
    { id: 'duration', label: '比賽用時', minWidth: 100, align:'right',
      format: (value: number) => functions.formatSeconds(value),
    },
  ];

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
  const showRows = (items:Array<Data>) => {
    // console.log(items);
    items = items.map((row) => {
      /*處理資料*/
      return row;
    })
    setRows(items)
  }
  const getData = async(where:any={}) => {
    try {
      let result = await functions.fetchData('GET', 'matchs', null, where);
      setSelected([]);
      setUserIdMap({ ...userIdMap, ...result.user_map});
      showRows(result.data);
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('取得比賽紀錄資料發生錯誤', 'error');
    }
  }

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
  const clickTableMatchs = (idx:number, item:any) => {
    // console.log(item);
    if(idx<0 && idx>=rows.length){ return; }
    MatchModelRef.current?.setUserMap(userIdMap);
    MatchModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }
  const deleteSelectedMatchIds = async ()=>{
    let selectedIds = selected;
    // console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'matchs', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          await goSearch();
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        showMessage('刪除比賽紀錄發生錯誤', 'error');
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】個比賽紀錄，確認執行嗎？`,
      '確認',
      do_function
    );
  }

  const MatchModelRef = React.useRef<MatchModelMyChildRef>(null);
  const renewListMatchs = async (idx, item)=>{
    item['duration'] = Number(item['duration']);
    rows[idx] = {...rows[idx], ...item};
    showRows(rows);
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
          {label:'姓名/綽號/LINE名稱', name:'name_keyword', type:'text', options:[], size:{xs:12}},
        ]}
        ref={SearchFormModelRef} />
    </>}
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={1} sx={{ border: '1px solid #E0E0E0' }}></TableCell>
              <TableCell align="center" colSpan={2} sx={{ border: '1px solid #E0E0E0' }}>隊伍1</TableCell>
              <TableCell align="center" colSpan={2} sx={{ border: '1px solid #E0E0E0' }}>比數</TableCell>
              <TableCell align="center" colSpan={2} sx={{ border: '1px solid #E0E0E0' }}>隊伍2</TableCell>
              <TableCell align="center" colSpan={1} sx={{ border: '1px solid #E0E0E0' }}></TableCell>
            </TableRow>
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
                        <TableCell key={column.id} align={column.align} onClick={()=>{clickTableMatchs(idx, row)}}>
                          {<Link to="#" style={{color: '#0288d1'}}>
                            {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                          </Link>}
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
    <Box textAlign="left" sx={{mt:'1rem'}}>
      <Button size="small" variant="contained" color='error' onClick={deleteSelectedMatchIds}>
        <DeleteForeverIcon />
      </Button>
    </Box>

    <MatchModel updateBodyBlock={updateBodyBlock}
              reGetList={()=>{goSearch()}}
              renewList={renewListMatchs}
              ref={MatchModelRef} />
  </>);
}
export default React.forwardRef<MyChildRef, MyChildProps>(TableMatchs);