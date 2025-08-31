import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';

import SettingsIcon from '@mui/icons-material/Settings';
interface BottomMenuProps {
  onUserClick: () => void;
  onMatchClick: () => void;
}

export default function BottomMenu({ onUserClick,onMatchClick }: BottomMenuProps) {
  const [value, setValue] = React.useState('');

  return (
    <Box sx={{ minWidth: 300 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction onClick={onUserClick} // 呼叫父層傳來的函數
          label="球員" icon={<GroupAddIcon />}/>
        <BottomNavigationAction onClick={()=>{}} // 呼叫父層傳來的函數
          label="場地" icon={<LibraryAddIcon />} />
        <BottomNavigationAction onClick={onMatchClick} // 呼叫父層傳來的函數
          label="比數" icon={<ScoreboardIcon />} />
        <BottomNavigationAction onClick={()=>{}} // 呼叫父層傳來的函數
          label="參數" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  );
}
