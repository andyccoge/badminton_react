import * as functions from '../functions.tsx';
import * as React from 'react';
import { useSnackbar } from 'notistack';
// import '../pwa.js' /*暫時關閉註冊瀏覽器通知*/

import {Box, Grid, Skeleton} from '@mui/material';
import {Card,CardContent} from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import AdminNav from '../components/AdminNav'
import PlayDateModel, {MyChildRef as playDateModelMyChildRef} from '../components/PlayDateModel'
import PlaydateCard from '../components/PlaydateCard'
import PlaydateCalendar, {MyChildRef as PlaydateCalendarMyChildRef} from '../components/PlaydateCalendar'

const today = new Date();
const alertTime_s = -1*60*60*1000;    /*提醒時間-開始(目前時間往前算1小時)*/
const alertTime_e = 24*60*60*1000+1;  /*提醒時間-結束(目前時間往後算24小時)*/

function Playdates({updateBodyBlock, showConfirmModelStatus}) {
  const { enqueueSnackbar } = useSnackbar();
  const showMessage = functions.createEnqueueSnackbar(enqueueSnackbar);

  const [cards, setCards] = React.useState<any[]>([]);
  const [currentPlay, setCurrentPlay] = React.useState<any[]>([]);
  // 建立 group，每次 cards 更新都會重新建立
  const card_group = React.useMemo(() => {
    return cards.reduce((acc, item, index) => {
      const dateKey = item.datetime.split(' ')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(index);
      return acc;
    }, {});
  }, [cards]);

  
  const [initFinished, setInitFinished] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      updateBodyBlock(true); //顯示遮蓋
      try {
        await getCurrentPlay();
        await getData();

      } catch (error) {
        console.error('Error fetching data:', error);
      }
      updateBodyBlock(false); //關閉遮蓋
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const getData = async (where:any=null):Promise<any[]> => {
    let result = await functions.fetchData('GET', 'play_date', null, where);
    // console.log(result.data);
    setCards(result.data);
    // console.log(cards)
    // console.log(card_group)
    return result.data;
  }
  const getgetCurrentPlayTime = () => {
    const temp_d1 = new Date(today.getTime() + alertTime_s);
    const temp_d2 = new Date(today.getTime() + alertTime_e);
    const datetime_s = temp_d1.getFullYear()+'-'+
                    String(temp_d1.getMonth()+1).padStart(2,'0')+'-'+
                    String(temp_d1.getDate()).padStart(2,'0')+' '+
                    String(temp_d1.getHours()).padStart(2,'0')+':'+
                    String(temp_d1.getMinutes()).padStart(2,'0');
    const datetime_e = temp_d2.getFullYear()+'-'+
                    String(temp_d2.getMonth()+1).padStart(2,'0')+'-'+
                    String(temp_d2.getDate()).padStart(2,'0')+' '+
                    String(temp_d2.getHours()).padStart(2,'0')+':'+
                    String(temp_d2.getMinutes()).padStart(2,'0');
    return [datetime_s, datetime_e];
  }
  const getCurrentPlay = async ():Promise<void> => {
    setInitFinished(false);
    const [datetime_s, datetime_e] = getgetCurrentPlayTime();
    let result = await functions.fetchData('GET', 'play_date', null, {
      'datetime_s': datetime_s,
      'datetime_e': datetime_e,
    });
    result.data.reverse();
    setInitFinished(true);
    setCurrentPlay(result.data);
    // console.log(result.data);
  }

  const reGetList = async (where:any=null):Promise<any[]> => {
    await getCurrentPlay();
    let data = await getData(where);
    return data;
  }
  const renewList = async (idx, item)=>{
    cards[idx] = item;
    setCards(cards);
  }

  /*切換顯示模式(卡塊or列表)*/
  const [showWay, setShowWay] = React.useState('list');
  const handleShowWayChange = async(
    event: React.MouseEvent<HTMLElement>,
    newShowWay: string,
  ) => {
    if (newShowWay !== null) {
      updateBodyBlock(true)
      if(newShowWay=='month' && showWay!='month'){
        await playdateCalendarRef.current?.getPageHighlightedDays()
      }else if(newShowWay!='month' && showWay=='month'){
        await getData()
      }
      setShowWay(newShowWay);
    }
    updateBodyBlock(false)
  };
  const showWayControl = {
    value: showWay,
    onChange: handleShowWayChange,
    exclusive: true,
  };

  const playdateCalendarRef = React.useRef<PlaydateCalendarMyChildRef>(null);

  const playDateModelRef = React.useRef<playDateModelMyChildRef>(null);
  const openPlayDateModel = (id, index) =>{
    let tempData = index==-1 ? {} : cards[index]
    // console.log(id+':'+index)
    playDateModelRef.current?.setModel(index, tempData); // 呼叫 child 的方法
  }
  const viewPlayDate = (id, index) =>{
    let view_url = '/playdate?id='+id;
    // console.log(view_url)
    window.open(view_url);
  }
  const doPlayDate = (id) =>{
    let view_url = '/play?id='+id;
    console.log(view_url);
  }
  const deletePlayDate = async (id, index) =>{
    let tempData = cards[index];
    if(
      confirm(`\
        確定刪除以下打球日？
        日期：`+tempData.datetime+`~`+tempData.datetime2+`
        地點：`+tempData.location+`
        備註：`+tempData.note+`
      `)
    ){
      updateBodyBlock(true);
      let result = await functions.fetchData('DELETE', 'play_date', null, {id:id});
      if(result.msg){
        showMessage(result.msg, 'error');
      }else{
        await reGetList();
      }
      updateBodyBlock(false);
    }
  }

  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <Box className="invisible pb-3"><AdminNav /></Box>

      <Box sx={{display:'flex', justifyContent:'center'}}>
        <Card sx={{ maxWidth: 345, minWidth: 275, }}>
          { !initFinished && <>
            <CardContent>
              <Typography gutterBottom variant="h4" component="div" className='flex justify-center'>
                <Skeleton animation="wave" variant="rounded" width={100}/>
              </Typography>
              <Typography variant="body2">
                <Skeleton animation="wave" width="60%"/>
                <Skeleton animation="wave" width="60%"/>
                <Skeleton animation="wave" width="45%"/>
                <Skeleton animation="wave" width="30%"/>
                <Skeleton animation="wave"/>
              </Typography>
            </CardContent>
          </>}
          { initFinished && <>
              <CardContent>
                {currentPlay.length>0 && <>
                  <Typography gutterBottom variant="h5" component="div">
                    <Button size="large" 
                            onClick={() => doPlayDate(currentPlay[0].id)}
                    >開始排點</Button>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} align='left'>
                    打球日期：{currentPlay[0].datetime.split(" ")[0]}<br/>
                    打球時間：{currentPlay[0].datetime.split(" ")[1]}~{currentPlay[0].datetime2.split(" ")[1]}<br/>
                    球場位置：{currentPlay[0].location}<br/>
                    球場面數：??<br/>
                    備註：{currentPlay[0].note}
                  </Typography>
                </>}
                {currentPlay.length==0 && <>
                  <Box height="150px">
                    <Typography gutterBottom variant="h5" component="div">無需安排</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getgetCurrentPlayTime().map((item, index) => (
                          <React.Fragment key={'topCard-'+index}>
                            {item}<br />
                            {index==0 && <React.Fragment>~<br /></React.Fragment>}
                          </React.Fragment>
                        ))}
                        間無打球日需排點
                      </Typography>
                    </Box>
                  </Box>
                </>}
              </CardContent>
          </>}
        </Card>
      </Box>

      <Box className='relative'>
        <Divider className="pb-3" sx={{mb:2}}/>
        <Stack spacing={2} className='absolute bottom-0 right-0'>
          <ToggleButtonGroup size="small" {...showWayControl} aria-label="Small sizes">
            <ToggleButton value="list" key="showWay_list">
              <ViewListIcon/>
            </ToggleButton>
            <ToggleButton value="card" key="showWay_card" sx={{display:{xs:'none', sm:'inline-block'}}}>
              <ViewModuleIcon/>
            </ToggleButton>
            <ToggleButton value="month" key="showWay_month">
              <CalendarMonthIcon/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      <Box sx={{display:showWay=='list'?'block': 'none'}}>
        {Object.keys(card_group).map((date, _) => (
          <Box key={'play_date_card-'+date+'-title'}>
            <Grid container spacing={2} sx={{mb:'1rem'}}>
              {card_group[date].map((card_idx, index) => (
                <Grid key={'play_date_card-'+date+'-'+index} size={{xs:12, sm:6, md:4, lg:3}} sx={{alignSelf:'end'}}>
                  <PlaydateCard updateBodyBlock={updateBodyBlock}
                    viewPlayDate={viewPlayDate}
                    openPlayDateModel={openPlayDateModel}
                    deletePlayDate={deletePlayDate}
                    card={cards[card_idx]}
                    index={card_idx}
                    preDatetime={index==0 ? '' : cards[card_idx].datetime}
                    alertTime_s={alertTime_s}
                    alertTime_e={alertTime_e}/>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
      <Box sx={{display:showWay=='card'?'block': 'none'}}>
        <Grid container spacing={2}>
          {cards.map((card, index) => (
            <Grid key={'play_date_card-' + index} size={{xs:12, sm:6, md:4, lg:3}} sx={{alignSelf:'end'}}>
              <PlaydateCard updateBodyBlock={updateBodyBlock}
                viewPlayDate={viewPlayDate}
                openPlayDateModel={openPlayDateModel}
                deletePlayDate={deletePlayDate}
                card={card}
                index={index}
                preDatetime={index==0?'':cards[index-1].datetime}
                alertTime_s={alertTime_s}
                alertTime_e={alertTime_e}
                />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{display:showWay=='month'?'block': 'none'}}>
        <PlaydateCalendar updateBodyBlock={updateBodyBlock}
          getData={getData}
          cards={cards}
          card_group={card_group}
          viewPlayDate={viewPlayDate}
          openPlayDateModel={openPlayDateModel}
          deletePlayDate={deletePlayDate}
          alertTime_s={alertTime_s}
          alertTime_e={alertTime_e}
          ref={playdateCalendarRef}/>
      </Box>

      <Box className="fixed bottom-0 right-0" 
           onClick={() => openPlayDateModel(-1,-1)}
           sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab size="small" color="secondary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>
      <Box margin={'3rem'}></Box>

      <PlayDateModel updateBodyBlock={updateBodyBlock}
                     reGetList={reGetList}
                     renewList={renewList}
                     ref={playDateModelRef} />
    </>
  )
}

export default Playdates
