// src/types/mui.d.ts
import { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Components {
    MuiPickersDay?: {
      defaultProps?: Partial<PickersDayProps>;
      styleOverrides?: {
        root?: React.CSSProperties | ((props: { theme: Theme }) => React.CSSProperties);
      };
      variants?: Array<{
        props: Partial<PickersDayProps>;
        style: React.CSSProperties;
      }>;
    };
  }
}
