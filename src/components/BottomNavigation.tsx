import * as React from 'react';

import Menu from './BottomNavigation/Menu';
import UserPanel from './BottomNavigation/UserPanel';
import {UserType} from '../components/UserNameCard';

export type MyChildRef = { // 子暴露方法給父
  setUserPanelDrawerOpen:(status:any) => void;
};
type MyChildProps = { // 父傳方法給子
  updateBodyBlock: () => void;
  users?:UserType[];
  cleanSeletedCourtName?: () => void;
  doSelectUser?: (userIdx:number) => void;
  setUserShowUp?: (idx:number) => void;
  setUserLeave?: (idx:number) => void;
  userIdxMatch?:number[],
};
const BottomNavigation = React.forwardRef<MyChildRef, MyChildProps>((
  { 
    updateBodyBlock, users=[], cleanSeletedCourtName,
    doSelectUser, setUserShowUp, setUserLeave, userIdxMatch=[],
    
  }, ref
) => {
  React.useImperativeHandle(ref, () => ({
    setUserPanelDrawerOpen:(status:any) => {setUserPanelDrawerOpen(status)},
  }));

  const [drawerOpen, setUserPanelDrawerOpen] = React.useState(false);

  return (
    <>
      {/* 下方選單，點擊 User 時打開 Drawer */}
      <Menu onUserClick={() => setUserPanelDrawerOpen(true)} />

      {/* 從底部彈出的 Drawer */}
      <UserPanel
        updateBodyBlock={updateBodyBlock}
        open={drawerOpen}
        onClose={() => {
          setUserPanelDrawerOpen(false);
          if(cleanSeletedCourtName){cleanSeletedCourtName()};
        }}
        users={users}
        doSelectUser={doSelectUser}
        setUserShowUp={setUserShowUp}
        setUserLeave={setUserLeave}
        userIdxMatch={userIdxMatch}
      />
    </>
  );
})
export default BottomNavigation;
