import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
// import Profile from './pages/Profile'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="/">首頁</Link>
        <Link to="/profile">會員資料</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

