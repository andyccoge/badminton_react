import * as React from 'react';

// import '../pwa.js' /*暫時關閉註冊瀏覽器通知*/
import * as functions from '../functions.tsx'
import AdminNav from '../components/AdminNav'
import PlayDateModel from '../components/PlayDateModel'
import PlaydateCard from '../components/PlaydateCard'

import {Box, Grid} from '@mui/material';
import {Card,CardContent} from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

function Playdates({updateBodyBlock}) {
  const [cards, setCards] = React.useState<any[]>([]);
  // 建立 group，每次 cards 更新都會重新建立
  const card_group = React.useMemo(() => {
    return cards.reduce((acc, item, index) => {
      const dateKey = item.datetime.split(' ')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(index);
      return acc;
    }, {});
  }, [cards]);

  React.useEffect(() => {
    (async () => {
      try {
        updateBodyBlock(true); //顯示遮蓋
        await getData();
        updateBodyBlock(false); //關閉遮蓋
      } catch (error) {
        console.error('Error fetching data:', error);
        updateBodyBlock(true); //關閉遮蓋
      }
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

  const getData = async () => {
    let result = await functions.fetchData('GET', 'play_date');
    // console.log(result.data);
    setCards(result.data);
    console.log(cards)
    console.log(card_group)
  }
  const renewList = async (idx, item)=>{
    cards[idx] = item;
    setCards(cards);
  }

  /*切換顯示模式(卡塊or列表)*/
  const [showWay, setShowWay] = React.useState('list');
  const handleShowWayChange = (
    event: React.MouseEvent<HTMLElement>,
    newShowWay: string,
  ) => {
    setShowWay(newShowWay);
  };
  const showWayControl = {
    value: showWay,
    onChange: handleShowWayChange,
    exclusive: true,
  };

  const playDateModelRef = React.useRef<{ setModel: (idx, item) => void }>(null);
  const openPlayDateModel = (id, index) =>{
    let tempData = index==-1 ? {} : cards[index]
    // console.log(id+':'+index)
    playDateModelRef.current?.setModel(index, tempData); // 呼叫 child 的方法
  }

  const viewPlayDateModel = (id, index) =>{
    let view_url = '/playdate?id='+id
    console.log(view_url)
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
        alert(result.msg);
      }else{
        await getData();
      }
      updateBodyBlock(false);
    }
  }

  const hide_alert = (datetime):boolean => {
    let tempDate = new Date(datetime)
    let now = new Date()
    if(now.getTime()<=tempDate.getTime() && tempDate.getTime()<(now.getTime()+24*60*60*1000)){
      // 開始時間在現在往後算24小時內
      return false;
    }
    return true;
  }
  const show_weekday = (datetime):string => {
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
  const show_date = (datetime):string => {
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

  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <Box className="invisible pb-3"><AdminNav /></Box>

      <Box sx={{display:'flex', justifyContent:'center'}}>
        <Card sx={{ maxWidth: 345 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              <Button size="large" onClick={getData}>開始排點</Button>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} align='left'>
              打球時間：YYYY-mm-dd HH:ii<br/>
              球場位置：新羽力<br/>
              球場面數：??<br/>
              (備註.....)
            </Typography>
          </CardContent>
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
              <GridViewIcon/>
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
                    viewPlayDateModel={viewPlayDateModel}
                    openPlayDateModel={openPlayDateModel}
                    deletePlayDate={deletePlayDate}
                    card={cards[card_idx]}
                    index={card_idx}
                    preDatetime={index==0 ? '' : cards[card_idx].datetime}/>
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
                viewPlayDateModel={viewPlayDateModel}
                openPlayDateModel={openPlayDateModel}
                deletePlayDate={deletePlayDate}
                card={card}
                index={index}
                preDatetime={index==0?'':cards[index-1].datetime}/>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box className="fixed bottom-0 right-0" 
           onClick={() => openPlayDateModel(-1,-1)}
           sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab size="small" color="secondary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>

      <PlayDateModel updateBodyBlock={updateBodyBlock}
                     reGetList={getData}
                     renewList={renewList}
                     ref={playDateModelRef} />
    </>
  )
}

export default Playdates
