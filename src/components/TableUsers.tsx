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

export const empty_searchForm = {
  ids:[],
  email: '',
  cellphone: '',
  gender: '',
  name_keyword: '',
  level_over: '',
};

interface Column {
  id: 'name' | 'name_line' | 'gender' | 'level';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'name', label: '姓名', minWidth: 100 },
  { id: 'name_line', label: '綽號', minWidth: 100 },
  { 
    id: 'gender', 
    label: '性別', 
    minWidth: 62,
    format: (value: number) => ['', '男', '女'][value]
  },
  { id: 'level', label: '等級', minWidth: 62 },
  // {
  //   id: 'density',
  //   label: 'Density',
  //   minWidth: 170,
  //   align: 'right',
  //   format: (value: number) => value.toFixed(2),
  // },
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
  countTotal?: number;
  where?: {},
  numPerPage?: number,
  needCheckBox?: boolean,
  needTool?: boolean,
};
function TableUsers(
  { 
    updateBodyBlock, getData, where={}, countTotal=0, numPerPage=10, needCheckBox=false, needTool=false,
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    where['p'] = newPage;
    getData(where);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    where['p'] = 0;
    getData(where);
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

  return (
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
              .map((row) => {
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
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
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
        rowsPerPageOptions={[10, 25, 100].concat(numPerPage).sort((a,b)=>(a - b))}
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
  );
}
export default React.forwardRef<MyChildRef, MyChildProps>(TableUsers);