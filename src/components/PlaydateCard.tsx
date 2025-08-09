import * as React from 'react';
import {Button, Typography, Box, Grid, Badge} from '@mui/material';
import {Card, CardActionArea, CardContent, CardActions} from '@mui/material';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditSquareIcon from '@mui/icons-material/EditSquare';

export function showWeekday(datetime):string{
  let tempDate = new Date(datetime)
  let now = new Date()
  if(tempDate.getFullYear()==now.getFullYear() && 
    tempDate.getMonth()==now.getMonth() &&
    tempDate.getDate()==now.getDate()
  ){
    return '今日';
  }else{
    return '星期' + ['日','一','二','三','四','五','六'][tempDate.getDay()];
  }
}
export function showDate(datetime):string{
  let tempDate = new Date(datetime)
  let now = new Date()
  if(tempDate.getFullYear()==now.getFullYear() && 
    tempDate.getMonth()==now.getMonth() &&
    tempDate.getDate()==now.getDate()
  ){
    return '即將到來';
  }else{
    return ' ' + (tempDate.getMonth()+1) + ' 月 ' + tempDate.getDate() + ' 號';
  }
}

export type MyChildRef = { // 子暴露方法給父
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: (status) => void;
  viewPlayDate: (id, idx) => void;
  openPlayDateModel: (id, idx) => void;
  deletePlayDate: (id, idx) => void;
  index: Number;
  card: any;
  preDatetime: string;
};

const PlaydateCard = React.forwardRef<MyChildRef, MyChildProps>((
  { updateBodyBlock,viewPlayDate,openPlayDateModel,deletePlayDate,card,index,preDatetime }, ref
) => {
  const hideAlert = (datetime):boolean => {
    let tempDate = new Date(datetime)
    let now = new Date()
    if(
      tempDate.getTime() >= (now.getTime() - 1*60*60*1000) && 
      tempDate.getTime() < (now.getTime() + 24*60*60*1000)
    ){
      // 開始時間在現在往後算24小時內
      return false;
    }
    return true;
  }
  const hideDatetimeTitle = ():boolean => {
  if(preDatetime==''){ return false; }
  else if(
    showWeekday(preDatetime)==showWeekday(card.datetime) &&
    showDate(preDatetime)==showDate(card.datetime)
  ){ return true; }
  return false;
  }

  return (
    <>
      <Typography gutterBottom variant="subtitle1" component="div" align='left'
            sx={{display:hideDatetimeTitle()?'none':'block',}}>
        {showWeekday(card.datetime)}
        <HorizontalRuleIcon /> 
        {showDate(card.datetime)}
      </Typography>
      <Badge color="secondary" variant="dot" invisible={hideAlert(card.datetime)} className='w-full'>
        <Card className='w-full'>
        <CardActionArea
          onClick={() => viewPlayDate(card.id, index)}
          sx={{
            height: '100%',
            '&[data-active]': {
              backgroundColor: 'action.selected',
              '&:hover': {
              backgroundColor: 'action.selectedHover',
              },
            },
          }}
        >
          <CardContent sx={{ height: '100%' }}>
            <Box className="flex justify-between">
              <Box>
                <Typography variant="h6" component="div" align='left'>
                  {card.location}_{"X"}面場
                </Typography>
                <Typography component="div" align='left'>
                  <Typography variant="body2" color="text.secondary" className='inline-block pr-3'>
                    報名狀態：{"XXX"}人
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{minWidth: '90px',}}>
                {/* <Typography variant="body1" color="text.secondary" align='right'>{(card.datetime+' ').split(" ")[0]}</Typography> */}
                <Typography variant="body1" color="text.secondary" align='right'>{(card.datetime+' ').split(" ")[1]}</Typography>
                <Typography variant="body1" color="text.secondary" align='right'>{(card.datetime2+' ').split(" ")[1]}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align='left'>
              備註：{card.note}
            </Typography>
            {/* {card.note?.trim() && ()} */}
          </CardContent>
        </CardActionArea>
        <CardActions className='flex justify-end' sx={{position: "relative", top: "-48px",}}>
          <Button size="small" 
              onClick={() => openPlayDateModel(card.id, index)}
          ><EditSquareIcon /></Button>
          <Button size="small" variant="contained" color='error'
              onClick={() => deletePlayDate(card.id, index)}
          ><DeleteForeverIcon /></Button>
        </CardActions>
        </Card>
      </Badge>
    </>
  )
});
export default PlaydateCard;