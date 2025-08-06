// theme.ts (或 theme.js)
import { createTheme } from '@mui/material/styles';

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
          color: theme.palette.mode === 'dark' ? '#000' : '#fff',
          backgroundColor: theme.palette.mode === 'dark' ? '#c3c3c3' : theme.palette.secondary.main,
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
  },
});
