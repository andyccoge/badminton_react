import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

import Grid from '@mui/material/Grid'
import BottomNavigation from '../components/BottomNavigation'

function Playdate() {
  const [count, setCount] = useState(0)

  return (   
    <>
      <Grid container spacing={0}>
        <Grid size={{ xs: 6, md: 8 }}>
          <div>xs=6 md=8</div>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <div>xs=6 md=4</div>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <div>xs=6 md=4</div>
        </Grid>
        <Grid size={{ xs: 6, md: 8 }}>
          <div>xs=6 md=8</div>
        </Grid>
      </Grid>
      <div style={{display:"flex", flexWrap: "wrap", justifyContent: "space-around"}}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="invisible pt-2">
        <BottomNavigation />
      </div>
      <footer id="footer_btn">
        <BottomNavigation/>
      </footer>
    </>
  )
}

export default Playdate
