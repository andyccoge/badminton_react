import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import {Box, Grid, Stack, Typography} from '@mui/material';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

import PlaydateCard, {showWeekday, showDate} from '../components/PlaydateCard'

const dayMark = '🏸';
const today = new Date();
const today_f = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
const initialValue = dayjs(today_f);

export type MyChildRef = { // 子暴露方法給父
  getPageHighlightedDays: () => void;
};
type MyChildProps = { // 父傳方法給子
  getData: (where:any) => Promise<any[]>;
  cards: any[];
  card_group: any[];
  updateBodyBlock: (status) => void;
  viewPlayDate: (id, idx) => void;
  openPlayDateModel: (id, idx) => void;
  deletePlayDate: (id, idx) => void;
  alertTime_s?: number;
  alertTime_e?: number;
};
function PlaydateCalendar(
  { getData,cards,card_group,
    updateBodyBlock,viewPlayDate,openPlayDateModel,deletePlayDate,
    alertTime_s = 0, alertTime_e = 0,
  }: MyChildProps,
  ref: React.Ref<MyChildRef>
) {
  const [selectedDate, setSelectedDate] = React.useState<string>(today_f);

  function ServerDay(props: PickersDayProps & { highlightedDays?: number[] }) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    other.onDaySelect = (day:Dayjs) =>{
      setSelectedDate(day.format('YYYY-MM-DD'))
    }

    const isMarked =
      !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;
    const isSelected = selectedDate && day.isSame(selectedDate, 'day');

    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={isMarked ? dayMark : undefined}
      >
        <PickersDay {...other} day={day}
                    outsideCurrentMonth={outsideCurrentMonth}
                    className={isSelected?'MuiPickersDay-isSelected':''}
                  />
      </Badge>
    );
  }
  async function getMonthData(date: Dayjs, { signal }: { signal: AbortSignal }) {
    // 取得所在月份的打球日資料
    let tempCards = await getData({
      'date_s':date.format('YYYY-MM-01'),
      'date_e':date.endOf('month').format('YYYY-MM-DD'),
    });
    // console.log(result)

    const days: number[] = tempCards.map((data, _) => {
      const temp = new Date(data.datetime);
      return temp.getDate();
    });
    const daysToHighlight = [...new Set(days)];
    // console.log(daysToHighlight);

    return { daysToHighlight };
  }

  const requestAbortController = React.useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState<number[]>([]);

  const fetchHighlightedDays = async(date: Dayjs) => {
    updateBodyBlock(true)
    const controller = new AbortController();
    try {
      let { daysToHighlight } = await getMonthData(date, {
        signal: controller.signal,
      })
      setHighlightedDays(daysToHighlight);
      setIsLoading(false);
      
    } catch (error) {
      // ignore the error if it's caused by `controller.abort`
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
    updateBodyBlock(false)
    requestAbortController.current = controller;
  };

  React.useEffect(() => {
    // abort request on unmount
    return () => requestAbortController.current?.abort();
  }, []);
  React.useImperativeHandle(ref, () => ({
    getPageHighlightedDays: async()=>{
      if(selectedDate){
        console.log(selectedDate)
        await fetchHighlightedDays(dayjs(selectedDate))
      }else{
        console.log(initialValue)
        await fetchHighlightedDays(initialValue)
      }
    },
  }));

  const handleMonthChange = async (date: Dayjs) => {
    if (requestAbortController.current) {
      // make sure that you are aborting useless requests
      // because it is possible to switch between months pretty quickly
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setSelectedDate('')
    await setHighlightedDays([]);
    await fetchHighlightedDays(date);
  };

  return (
    <Grid container spacing={0}>
      <Grid container size={{xs:12, sm:6, md:4}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            defaultValue={initialValue}
            loading={isLoading}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{
              day: ServerDay,
            }}
            slotProps={{
              day: {
                highlightedDays,
              } as any,
            }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid container size={{xs:12, sm:6, md:8}}>
        <Stack className='w-full'>
          <Typography gutterBottom variant="subtitle1" component="div" align='left' sx={{visibility:selectedDate?'visible':'hidden'}}>
            {showWeekday(selectedDate)}
            <HorizontalRuleIcon /> 
            {showDate(selectedDate)}
          </Typography>
          <Grid container spacing={2} size={{xs:12}}>
            {!card_group[selectedDate] && '無資料'}
            {card_group[selectedDate] && card_group[selectedDate].map((idx, index) => (
              <Grid key={'play_date_card-' + index} size={{xs:12, md:6, xl:4}} sx={{alignSelf:'start'}}>
                <PlaydateCard updateBodyBlock={updateBodyBlock}
                  viewPlayDate={viewPlayDate}
                  openPlayDateModel={openPlayDateModel}
                  deletePlayDate={deletePlayDate}
                  card={cards[idx]}
                  index={idx}
                  preDatetime={cards[idx].datetime}
                  alertTime_s={alertTime_s}
                  alertTime_e={alertTime_e}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}
export default React.forwardRef<MyChildRef, MyChildProps>(PlaydateCalendar);