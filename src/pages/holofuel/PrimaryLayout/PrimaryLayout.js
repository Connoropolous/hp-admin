import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import Dashboard from 'pages/holofuel/Dashboard'
import TransactionHistory from 'pages/holofuel/TransactionHistory'
import Inbox from 'pages/holofuel/Inbox'
import CreateOffer from 'pages/holofuel/CreateOffer'
import CreateRequest from 'pages/holofuel/CreateRequest'
import ScreenWidthContext from 'contexts/screenWidth'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/holofuel/colors.css'
import 'global-styles/holofuel/index.css'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>

    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/inbox' exact component={Inbox} />
    <Route path='/offer' exact component={CreateOffer} />
    <Route path='/request' exact component={CreateRequest} />
    <Route path='/history' component={TransactionHistory} />
  </div>
}

export default PrimaryLayout
