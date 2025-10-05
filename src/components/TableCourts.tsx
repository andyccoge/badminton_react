import * as functions from '../functions'
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

import SearchFormModel, {
  MyChildRef as SearchFormModelMyChildRef
} from '../components/Model/SearchFormModel';
import CourtModel, {MyChildRef as CourtModelMyChildRef} from '../components/Model/CourtModel';

interface SearchForm {
  ids: any[];
  play_date_id: string | null;
  code: string | null;
  type: string | null;
  p: number;
  per_p_num: number;
}
export const empty_searchForm:SearchForm = {
  ids:[],
  play_date_id:'',
  code:'',
  type:'',
  p: 0,
  per_p_num: 0,
};

interface Column {
  id: 'code' | 'type' ;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'code', label: '編號', minWidth: 100 },
  { id: 'type', label: '類型', minWidth: 100, format: (value: number) => ['', '比賽', '預備'][value] },
];

export interface Data {
  id:number,
  play_date_id:number,
  code:string,
  type:number,
}
export interface CourtPlayData extends Data {
  duration: number;
  usersIdx: number[];
}


export type MyChildRef = { // 子暴露方法給父
  showRows: (items:Array<Data>) => void;
  getRows: () => Array<Data>;
  getSelectedIds: () => readonly number[];
  resetSelect: () => void;
  goSearch: () => void;
  setModel: (idx, item, primaryKey?) => void;
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status:boolean) => void;
  showConfirmModelStatus: (
    title: string,
    message: string,
    do_function_name?: string,
    do_function?: ()=> Promise<boolean>,
  ) => void;
  where?: {},
  countTotal?: number;
  numPerPage?: number,
  needSearch?: boolean,
  needCheckBox?: boolean,
  needTool?: boolean,
  renewCourts?: (items:Data[]) => void;
  renewCourt?: (idx:number, item:Data) => void;
  checkCourtsEditable?: (idx:number, item:Data) => string;
};
function TableCourts(
  { 
    updateBodyBlock, showConfirmModelStatus, where={}, countTotal=0, 
    numPerPage=10, needSearch=true, needCheckBox=false, needTool=false,
    renewCourts, renewCourt, checkCourtsEditable,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  React.useImperativeHandle(ref, () => ({
    showRows: (items:Array<Data>) => { showRows(items); },
    getRows: () => { return rows; },
    getSelectedIds: ():readonly number[] => { return selected; },
    resetSelect: () => { setSelected([]); },
    goSearch: async() => { await goSearch(); },
    setModel: (idx, item, primaryKey='id') => {
      CourtModelRef.current?.setModel(idx, item, primaryKey)
    },
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
  const showRows = (items:Array<Data>) => {
    // console.log(items);
    items = items.map((row) => {
      /*處理資料*/
      return row;
    })
    setRows(items)
  }
  const getData = async(where:any={}):Promise<{data:Data[]}> => {
    showRows([]);
    try {
      let result = await functions.fetchData('GET', 'courts', null, where);
      setRows(result.data);
      setSelected([]);
      showRows(result.data);
      return result;
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('取得場地紀錄資料發生錯誤', 'error');
    }
    return {data:[],};
  }

  const goSearch = async():Promise<{data:Data[]}> =>{
    updateBodyBlock(true);
    await setRows([]);
    await setPage(0);
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let tempSerchform:any = await SearchFormModelRef.current?.getFormData();
    tempSerchform['p'] = 0;
    const result = await getData(tempSerchform);
    updateBodyBlock(false);
    return result;
  }
  const deleteSelectedCourtIds = async ()=>{
    let selectedIds = selected;
    // console.log(selectedIds);
    if(selectedIds?.length==0){
      showMessage('請勾選刪除項目', 'error');return;
    }
    const do_function = async():Promise<boolean> => {
      updateBodyBlock(true);
      let modelStatus = true;
      try {
        let result = await functions.fetchData('DELETE', 'courts', null, {ids:selectedIds});
        if(result.msg){
          showMessage(result.msg, 'error');
        }else{
          modelStatus = false;
          const result2 = await goSearch();
          if(renewCourts){renewCourts(result2.data)};
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
        const data = error?.response?.data;
        if (typeof data === 'string') {
          if (data.match('fk_matchs_courts')){
            showMessage('有對應此場地的比賽紀錄，不可刪除', 'error');
          }else{
            showMessage('刪除場地紀錄發生錯誤', 'error');
          }
        }else{
          showMessage('刪除場地紀錄發生錯誤', 'error');
        }
      }
      updateBodyBlock(false);
      return modelStatus;
    }
    showConfirmModelStatus(
      `確認刪除？`,
      `即將刪除勾選的【`+ selectedIds?.length + `】個場地紀錄，確認執行嗎？`,
      '確認',
      do_function
    );
  }
  const clickTableCourts = (idx:number, item:any) => {
    // console.log(item);
    if(idx<0 && idx>=rows.length){ return; }
    CourtModelRef.current?.setModel(idx, item); // 呼叫 child 的方法
  }

  const CourtModelRef = React.useRef<CourtModelMyChildRef>(null);
  const reGetListCourts= async() => {
    const result = await goSearch();
    if(renewCourts){renewCourts(result.data)};
  }
  const renewListCourts = async (idx, item)=>{
    rows[idx] = {...rows[idx], ...item};
    showRows(rows);
    if(renewCourt){renewCourt(idx, item)};
  }

  return (<>
    <Button size="small" sx={{alignSelf:'center'}} variant="text" color="info"
            onClick={()=>{goSearch()}}>
      <AutorenewIcon color={'inherit'} fontSize={'small'} className='cursor-pointer' />
    </Button>
    <Box sx={{display:needSearch?'inline-flex':'none'}}>
      <Button size="small" sx={{mr:'1rem',alignSelf:'center'}} 
              onClick={()=>{SearchFormModelRef.current?.setFormModel(true)}}>
        搜尋設定<SearchIcon />
      </Button>
      <Button size="small" sx={{alignSelf:'center'}} variant="text" color="info" 
              onClick={()=>{SearchFormModelRef.current?.cleanSearch()}}>
        清除篩選
      </Button>
      <SearchFormModel goSearch={goSearch}
        formData={JSON.parse(JSON.stringify(where))}
        formColumns={[
          {label:'場地編號', name:'code', type:'text', options:[],},
          {label:'類型', name:'type', type:'select', options:[
            {text:'比賽', value:1},{text:'預備', value:2},
          ], size:{xs:6}},
        ]}
        ref={SearchFormModelRef} />
    </Box>
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
                            <Button color="info" onClick={()=>{clickTableCourts(idx, row)}} sx={{p:0, display:'align', justifyContent:'start'}}>
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
    <Box textAlign="left" sx={{mt:'1rem'}}>
      <Button size="small" variant="contained" color='error' onClick={deleteSelectedCourtIds}>
        <DeleteForeverIcon />
      </Button>
    </Box>

    <CourtModel updateBodyBlock={updateBodyBlock}
              reGetList={reGetListCourts}
              renewList={renewListCourts}
              checkEditable={checkCourtsEditable}
              ref={CourtModelRef} />
  </>);
}
export default React.forwardRef<MyChildRef, MyChildProps>(TableCourts);