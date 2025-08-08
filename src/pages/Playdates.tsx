import * as React from 'react';

// import '../pwa.js' /*暫時關閉註冊瀏覽器通知*/
import * as functions from '../functions.tsx'
import AdminNav from '../components/AdminNav'
import PlayDateModel from '../components/PlayDateModel'

import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditSquareIcon from '@mui/icons-material/EditSquare';

function Playdates({updateBodyBlock}) {
  const [cards, setCards] = React.useState<any[]>([]);
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

  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <Box className="invisible pb-3"><AdminNav /></Box>

      <Box sx={{display:'flex', justifyContent:'center'}}>
        <Card sx={{ maxWidth: 345 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              <Button size="large">開始排點</Button>
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
            <ToggleButton value="month" key="showWay_month">
              <CalendarMonthIcon/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 2,
        }}
      >
        {cards.map((card, index) => (
          <Box key={'play_date_card-' + index}>
            <Typography gutterBottom variant="subtitle1" component="div" align='left'>    
              今日 <HorizontalRuleIcon /> 即將到來
            </Typography>
            <Badge color="secondary" variant="dot" invisible={false} className='w-full'>
              <Card className='w-full'>
                <CardActionArea
                  onClick={() => viewPlayDateModel(card.id, index)}
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
                          {card.note?.trim() && (
                            <Typography variant="body2" color="text.secondary" className='inline-block'>
                              ({card.note})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary" align='right' sx={{minWidth: '90px',}}>
                        {card.datetime.split(" ").map((part, index) => (
                          <React.Fragment key={index}>
                            {part}
                            <br />
                          </React.Fragment>
                        ))}
                      </Typography>
                    </Box>
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
          </Box>
        ))}
      </Box>

      <Box className="fixed bottom-0 right-0" 
           onClick={() => openPlayDateModel(-1,-1)}
           sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab size="small" color="secondary" aria-label="add"
             >
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
