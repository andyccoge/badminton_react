// theme.ts (或 theme.js)
import { createTheme } from '@mui/material/styles';
import './types/mui.d.ts';

export const getTheme = (mode: "light" | "dark") => createTheme({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // 亮色主題(light)
          primary: { main: "#ffba00", contrastText: '#775500',},
          secondary: { main: "#cc9900", contrastText: '#594300',},
          background: { default: "#fff", paper: "#f5f5f5",},
          text: { primary: "#000", secondary: '#555',},
          error: { main: '#d32f2f',},
          warning: { main: '#ed6c02',},
          info: { main: '#0288d1',},
          success: { main: '#2e7d32',},
        }
      : {
          // 暗色主題(dark)
          primary: { main: "#333",},
          secondary: { main: "#666",},
          background: { default: "#121212", paper: "#1e1e1e",},
          text: { primary: "#fff", secondary: '#c3c3c3',},
          error: { main: '#d32f2f',},
          warning: { main: '#ed6c02',},
          info: { main: '#0288d1',},
          success: { main: '#2e7d32',},
        }),
  },
  components: {
    MuiButton:{
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiButton-colorPrimary':{
            color: theme.palette.mode === 'dark' ? '#000' : '#fff',
            backgroundColor: theme.palette.mode === 'dark' ? '#c3c3c3' : theme.palette.secondary.main,
          }
        }),
      }
    },
    MuiTextField:{
      styleOverrides: {
        root: ({ theme }) => ({
          '& label:has(+ div input[type="date"]),\
           & label:has(+ div input[type="time"])\
          ':{
            'transform': 'translate(12px, 4px) scale(0.75)',
          },
          '& input::-webkit-calendar-picker-indicator':{
            filter: theme.palette.mode === 'dark' ? 'initial' : 'invert(1)',
          },
        }),
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiBox-root, & .MuiBox-root .MuiButton-root': {
            backgroundColor: 'inherit',
          },
        }),
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiPickersDay-today':{
            background: theme.palette.mode === 'dark' ? '#333' : '#ffba0070',
          },
          '&.MuiPickersDay-isSelected':{
            border: theme.palette.mode === 'dark' ? '5px solid #333' : '5px solid #ffba00',
          },
        })
      }
    },
  },
});
