import React from 'react'
import Header from 'components/holofuel/Header'
import './Dashboard.module.css'

export default function Dashboard ({ me, happStoreUser, registerUser }) {
  return <React.Fragment>
    <Header />

    <div>
      This is the HoloFuel Dashboard.
    </div>
  </React.Fragment>
}