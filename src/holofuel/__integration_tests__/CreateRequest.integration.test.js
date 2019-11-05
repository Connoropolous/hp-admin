import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
// import { mockNavigateTo } from 'react-router-dom'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/integration-testing/conductorConfig'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

const agentId = getAgent().id
const amount = 123
const notes = 'Testing 123'

describe('HOLOFUEL : CreateRequest', () => {
  it('user can create a request and then view it in the transaction history', runConductor(async () => {
    console.log('6')

    const { getByTestId, getByText, getByLabelText, getByPlaceholderText, getAllByRole, debug } = await renderAndWait(<HoloFuelApp />)
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Request'))

    fireEvent.click(getByText('Request'))

    await wait(() => getByLabelText('From'))
    // request from ourself
    fireEvent.change(getByLabelText('From'), { target: { value: agentId } })
    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })
    fireEvent.change(getByPlaceholderText(/notes/i), { target: { value: notes } })
    fireEvent.click(getByText('Send'))

    const header = getAllByRole('region')[1]
    debug()
    await wait(() => within(header).getByText('Request'))
    debug()
    await wait(() => within(header).getByText('History'))
    expect(getByText(agentId)).toBeInTheDocument()
    expect(getByText(amount)).toBeInTheDocument()

    console.log('found "History", rerouted to TX Hitory Page, all is good')
  }), 150000)
})
