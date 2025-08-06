import * as React from 'react';

import BottomMenu from './BottomNavigation/Menu';
import BottomDrawer from './BottomNavigation/UserPanel';

export default function App() {
  const [drawerOpen, setUserPanelDrawerOpen] = React.useState(false);

  return (
    <>
      {/* 下方選單，點擊 User 時打開 Drawer */}
      <BottomMenu onUserClick={() => setUserPanelDrawerOpen(true)} />

      {/* 從底部彈出的 Drawer */}
      <BottomDrawer
        open={drawerOpen}
        onClose={() => setUserPanelDrawerOpen(false)}
      />
    </>
  );
}
