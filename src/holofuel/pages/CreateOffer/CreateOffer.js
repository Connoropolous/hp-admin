import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import './CreateOffer.module.css'

// TODO: these constants should come from somewhere more scientific
export const FEE_PERCENTAGE = 0.01
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterparty: yup.string()
    .required()
    .length(AGENT_ID_LENGTH),
  amount: yup.number()
    .required()
    .positive()
})

function useOfferMutation () {
  const [offer] = useMutation(HolofuelOfferMutation)
  return (amount, counterparty, notes) => offer({
    variables: { amount, counterparty, notes }
  })
}

export default function CreateOffer ({ history: { push } }) {
  const createOffer = useOfferMutation()

  const [counterparty, setCounterparty] = useState('')
  const [fee, setFee] = useState(0)
  const [total, setTotal] = useState(0)

  const { register, handleSubmit, errors } = useForm({ validationSchema: FormValidationSchema })

  const onAmountChange = amount => {
    if (isNaN(amount)) return
    const newFee = Number(amount) * FEE_PERCENTAGE
    setFee(newFee)
    setTotal(Number(amount) + newFee)
  }

  const onSubmit = ({ amount, counterparty, notes }) => {
    createOffer(amount, counterparty, notes)
    push('/history')
  }

  !isEmpty(errors) && console.log('Offer form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Offer' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterparty' styleName='form-label'>To</label>
        <input
          name='counterparty'
          id='counterparty'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterparty(value)} />
        <div styleName='hash-icon-wrapper'>
          {counterparty.length === AGENT_ID_LENGTH && <HashIcon hash={counterparty} size={26} />}
        </div>
        <div styleName='hash-nickname-wrapper'>
          {counterparty.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'><RenderNickname agentId={counterparty} /></h4>}
        </div>
      </div>
      <div styleName='form-row'>
        <label htmlFor='amount' styleName='form-label'>Amount</label>
        <input
          name='amount'
          id='amount'
          type='number'
          styleName='number-input'
          ref={register}
          onChange={({ target: { value } }) => onAmountChange(value)} />
        <span styleName='hf'>HF</span>
      </div>
      <div styleName='form-row'>
        <label htmlFor='fee' styleName='form-label'>Fee (1%)</label>
        <input
          name='fee'
          id='fee'
          value={fee.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>HF</span>
      </div>
      <div styleName='form-row'>
        <label htmlFor='total' styleName='form-label'>Total</label>
        <input
          name='total'
          id='total'
          value={total.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>HF</span>
      </div>
      <textarea
        styleName='notes-input'
        name='notes'
        placeholder='Notes'
        ref={register} />
      <Button type='submit' wide variant='secondary' styleName='send-button'>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId }) {
  const { loading, error, data } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  if (loading) {
    return <React.Fragment>
      <Loader
        type='ThreeDots'
        color='#00BFFF'
        height={30}
        width={30}
        timeout={5000}
      />
     Loading
    </React.Fragment>
  }
  if (error || !data.holofuelCounterparty.nickname) return <React.Fragment>No nickname available.</React.Fragment>
  return <React.Fragment>{data.holofuelCounterparty.nickname}</React.Fragment>
}
