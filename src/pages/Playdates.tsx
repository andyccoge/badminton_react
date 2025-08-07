import * as React from 'react';

// import '../pwa.js' /*暫時關閉註冊瀏覽器通知*/
import * as functions from '../functions.tsx'
import AdminNav from '../components/AdminNav'

import Box from '@mui/material/Box';
// import CardActions from '@mui/material/CardActions';
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

function Playdates() {
  const [cards, setCards] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => { // IIFE
      try {
        let result = await functions.fetchData('GET', 'play_date');
        console.log(result.data);
        setCards(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })(); // Call the IIFE immediately
  }, []); // Empty dependency array ensures it runs only once on mount

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

  const [selectedCard, setSelectedCard] = React.useState(0);

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
          {/* <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions> */}
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
                  onClick={() => setSelectedCard(index)}
                  data-active={selectedCard === index ? '' : undefined}
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
                          {card.location}_{2}面場
                        </Typography>
                        <Typography component="div" align='left'>
                          <Typography variant="body2" color="text.secondary" className='inline-block pr-3'>
                            報名狀態：{10}人
                          </Typography>
                          {card.note?.trim() && (
                            <Typography variant="body2" color="text.secondary" className='inline-block'>
                              ({card.note})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary" align='right'>
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
              </Card>
            </Badge>
          </Box>
        ))}
      </Box>
    </>
  )
}

export default Playdates
