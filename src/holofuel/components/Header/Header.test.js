import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('components/HashAvatar')

it('should render the title and a menu icon', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' }
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))
  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should render the title and a menu icon with update badge when inbox updates exist', () => {
  const props = {
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' },
    inboxCount: 2
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(menuIconTitle)).toBeInTheDocument()
  expect(getByTestId('inboxCount-badge')).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should render the menu icon without update badge when no inbox updates exist', () => {
  const props = {
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' },
    inboxCount: 0
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(menuIconTitle)).toBeInTheDocument()
  expect(document.querySelector('[data-testid="inboxCount-badge"]')).not.toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should copy the agentId when clicked and trigger the proper flash message', async () => {
  const nickname = 'My rad nickname'
  const props = {
    title: 'the title',
    history: {
      push: () => {}
    },
    agent: {
      id: 'QmAGENTHASH',
      nickname
    }
  }

  const { getByTestId } = render(<Header {...props} />)
  await act(async () => {
    fireEvent.click(getByTestId('hash-icon'))
    await wait(100)
  })
  expect(mockNewMessage).toHaveBeenCalledWith(`Your HoloFuel Agent ID has been copied!`, 5000)
})
