import { useState } from 'react'
import Grid from '@mui/material/Grid'

import AdminNav from '../components/AdminNav'

function Users(updateBodyBlock) {
  const [count, setCount] = useState(0)

  return (   
    <>
      <header id="header_nav"><AdminNav /></header>
      <div className="invisible pb-2"><AdminNav /></div>

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
    </>
  )
}

export default Users
