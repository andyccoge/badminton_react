import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';

import {Grid, Button, Typography, TextareaAutosize} from '@mui/material';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';
import { FormHelperText } from '@mui/material';

export type MyChildRef = { // 子暴露方法給父
};
type MyChildProps = { // 父傳方法給
  updateBodyBlock: (status:boolean) => void;
  showConfirmModelStatus: (
    title: string,
    message: string,
    do_function_name?: string,
    do_function?: ()=> Promise<boolean>,
  ) => void;
  playDateId: string;
  renewReservations: () => void;
};
function TextAreaBatchReservation(
  { 
    updateBodyBlock, showConfirmModelStatus, playDateId, renewReservations,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);
  React.useImperativeHandle(ref, () => ({
  }));

  const [batchUserText, setBatchUserText] = React.useState("");
  const [batchAddModelStatus, setbatchAddModelStatus] = React.useState(false);
  const [repeatName, setRepeatName] = React.useState<string>();
  const [fuzzyNames, setFuzzyNamesNames] = React.useState<string>();
  const [OkNames, setOkNames] = React.useState<string>();

  async function batchAdd(tempStr:string) {
    if(!batchUserText.trim()){
      showMessage('請設定名單，以「換行」分隔球員', 'error');
      return;
    }
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let names = functions.getTextareaUserNames(tempStr);
    // console.log(names);

    try {
      let result = await functions.fetchData('PUT', 'user_batch', {names:names, play_date_id:playDateId});
      if(result.repeat_name.length>0 || result.fuzzy_names.length>0){
        setRepeatName(result.repeat_name.join("\n"))
        setFuzzyNamesNames(result.fuzzy_names.join("\n"))
        setOkNames(result.ok_names.join("\n"))
        setbatchAddModelStatus(true)
      }else{
        await setBatchUserText('');
        await renewReservations();
        showMessage('報名紀錄已新增', 'success');
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      showMessage('批次設定報名紀錄發生錯誤', 'error');
    }
    updateBodyBlock(false); //隱藏遮蓋
  }
  async function sendNames() {
    updateBodyBlock(true); //顯示遮蓋
    // await new Promise((resolve) => { setTimeout(() => {resolve(null);}, 100); })
    let tempStr = '';
    tempStr += repeatName ? ("\n"+repeatName)?.toString() : '';
    tempStr += fuzzyNames ? ("\n"+fuzzyNames)?.toString() : '';
    tempStr += OkNames ? ("\n"+OkNames)?.toString() : '';
    tempStr = tempStr.trim();
    setBatchUserText(tempStr);
    setbatchAddModelStatus(false);
    await batchAdd(tempStr);
    updateBodyBlock(false); //隱藏遮蓋
  }

  return (<>
    <Grid container spacing={0} sx={{mb:'1rem'}}>
      <Grid size={{xs:12, sm:10, md:11}}>
        <FormHelperText error={true}>
          請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至本日報名紀錄中
        </FormHelperText>
        <TextareaAutosize
          aria-label="批次設定球員"
          minRows={3} maxRows={3}
          placeholder="請複製名單並貼入此輸入區，「每列」將被視為1為球員，並新增至本日報名紀錄中"
          style={{ width: '100%' }}
          value={batchUserText}
          onChange={(e) => setBatchUserText(e.target.value)}
        />
      </Grid>
      <Grid size={{xs:12, sm:2, md:1}}>
        <Button onClick={()=>{batchAdd(batchUserText)}}>送出</Button>
      </Grid>
    </Grid>

    <React.Fragment>
      <Dialog
        open={batchAddModelStatus}
        keepMounted
        onClose={()=>{setbatchAddModelStatus(false)}}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{pb:'0.5rem'}}>
          {"重複資料處理"}
          <Typography variant="body2" gutterBottom>完成操作後請點「送出」再次進行資料新增</Typography>
        </DialogTitle>
        <DialogContent>
          <FormHelperText error={true}>此區球員重複報名，請修改or刪除後再次送出資料</FormHelperText>
          <TextareaAutosize
            aria-label="重複報名名單"
            minRows={3} maxRows={3}
            placeholder="此區球員重複報名，請修改or刪除後再次送出資料"
            style={{ width: '100%', marginBottom:'1rem', }}
            value={repeatName}
            onChange={(e) => setRepeatName(e.target.value)}
          />
          
          <FormHelperText error={true}>
            此區名單在系統中對應到多個球員，請保留「:」後的一組資料，其餘請刪除，然後重新送出。<br />
            ex： 安安:[陳彥安,安仔,男] 對應關係如右=&gt; LINE名稱:[姓名,綽號,性別]
          </FormHelperText>
          <TextareaAutosize
            aria-label="模糊名稱名單"
            minRows={3} maxRows={3}
            placeholder={
              "此區名單在系統中對應到多個球員，請保留「:」後的一組資料，其餘請刪除，然後重新送出。"+"\n"+
              "ex： 安安:[陳彥安,安仔,男]"
            }
            style={{ width: '100%', marginBottom:'1rem', }}
            value={fuzzyNames}
            onChange={(e) => setFuzzyNamesNames(e.target.value)}
          />

          <FormHelperText error={false}>可新增名單(新名單將自動建立「球員資料」)</FormHelperText>
          <TextareaAutosize
            aria-label="可新增名單"
            minRows={3} maxRows={3}
            placeholder="可新增名單(新名單將自動建立「球員資料」"
            style={{ width: '100%', marginBottom:'1rem', }}
            value={OkNames}
            onChange={(e) => setOkNames(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{setbatchAddModelStatus(false)}} size="small" color="secondary">取消</Button>
          <Button onClick={()=>{sendNames()}} size="medium" color="primary">送出</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  </>);
}
export default React.forwardRef<MyChildRef, MyChildProps>(TextAreaBatchReservation);