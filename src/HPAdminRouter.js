import React from 'react'
import { Route, Link } from 'react-router-dom'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import Settings from 'pages/Settings'
import Tos from 'pages/Tos'
import BrowseHapps from 'pages/BrowseHapps'
import HappDetails from 'pages/HappDetails'
import ManagePricing from 'pages/ManagePricing'
import HostingEarnings from 'pages/HostingEarnings'
import MyProfile from 'pages/MyProfile'
import StyleDemo from 'pages/StyleDemo'
import Login from 'pages/Login'
import FactoryResetInstructions from 'pages/FactoryResetInstructions'

// NB: This is a placeholder for the ticket to holofuel build compatible with hp admin
// import { HoloFuelApp } from 'root'

export default function HPAdminRouter () {
  return <>
    <Route path='/login' component={Login} />
    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/browse-happs' exact component={BrowseHapps} />
    <Route path='/browse-happs/:appId' component={HappDetails} />
    <Route path='/pricing' component={ManagePricing} />
    <Route path='/settings' exact component={Settings} />
    <Route path='/tos' exact component={Tos} />
    <Route path='/earnings' component={HostingEarnings} />
    <Route path='/my-profile' component={MyProfile} />
    <Route path='/factory-reset' component={FactoryResetInstructions} />

    <Route path='/style-demo' component={StyleDemo} />

    {/* <Route path='/holofuel' exact component={HoloFuelApp} /> */}
    <Route path='/holofuel' render={() => <div style={{ marginTop: 50, textAlign: 'center' }}>
      This page will redirect to the HoloFuel app
      <br />
      <br />
      <br />
      <Link to='/dashboard'
        style={{
          marginLeft: 'auto',
          color: '#484848',
          backgroundColor: '#CDCDCD',
          fontWeight: 'bold',
          fontSize: 14,
          minWidth: 67,
          padding: 10,
          borderRadius: 5
        }}>
        Home
      </Link>
    </div>} />

  </>
}
