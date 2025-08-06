import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface BottomMenuProps {
  onUserClick: () => void;
}

export default function BottomMenu({ onUserClick }: BottomMenuProps) {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ minWidth: 320 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="添加場地" icon={<LibraryAddIcon />} />
        <BottomNavigationAction label="參數設定" icon={<SettingsIcon />} />
        <BottomNavigationAction label="比賽紀錄" icon={<ReceiptLongIcon />} />
        <BottomNavigationAction
          label="球員管理"
          icon={<SupervisorAccountIcon />}
          onClick={onUserClick} // 呼叫父層傳來的函數
        />
      </BottomNavigation>
    </Box>
  );
}
