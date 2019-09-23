const { connect } = require('@holochain/hc-web-client')
const axios = require('axios')
const Agent1TransactionLedger = require('./Agent1HFLedger.js')
const Agent2TransactionLedger = require('./Agent2HFLedger.js')

// HoloFuel Users :
const Agent1 = {
  // agentId: <CONDUCTOR_AGENT_1>,
  agentId: 'HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a',
  nick: 'Perry'
}
const Agent2 = {
  // agentId: <CONDUCTOR_AGENT_2>,
  agentId: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
  nick: 'Sam'
}
// HoloFuel User Transactions Log :
const AGENT_1 = Agent1TransactionLedger
const AGENT_2 = Agent2TransactionLedger
// Transaction Types :
const REQUEST = 'requests'
const OFFER = 'offers.initated'
const PAY = 'offers.responding'
const ACCEPT = 'offers.accepted'

const startTestConductor = async () => {
  return new Promise((resolve, reject) => {
    const callToHC = axios.post('http://localhost:3300/admin/agent/list', {})
    resolve(callToHC)
  })
    .catch(e => { throw new Error(` \n \n >>>>>>>>>>>>>>>>>>> NO HC Conductor Found. <<<<<<<<<<<<<<< \n >>>>>>>>> NOTE: Make sure your HC conductor is running! <<<<<<<<< \n \n`) })
}

const transactHoloFuel = (agentId, type, ZomeCall, { index, transactionTrace, originId }) => {
  const txType = type === OFFER ? agentId[`offers`][`initated`] : agentId[type]
  const counterparty = agentId === AGENT_1 ? Agent2.agentId : Agent1.agentId

  let origininatingTx = null
  if (transactionTrace || transactionTrace === 0) {
    // For payment of a request or acceptance of a payment:
    const otherAgent = agentId === AGENT_1 ? AGENT_2 : AGENT_1
    origininatingTx = otherAgent[REQUEST][transactionTrace]
  }

  switch (type) {
    case REQUEST: {
      console.log('\n INVOKING REQUEST CALL ****************************')
      // initate request
      return ZomeCall(
        'holofuel',
        'transactions',
        'request',
        { from: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case OFFER: {
      console.log('\n INVOKING OFFER CALL ****************************')
      // initiate offer
      return ZomeCall(
        'holofuel',
        'transactions',
        'promise',
        { to: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case PAY: {
      console.log('\n INVOKING PAY CALL ****************************')
      // offer in response to request
      return ZomeCall(
        'holofuel',
        'transactions',
        'promise',
        {
          to: counterparty,
          amount: origininatingTx.amount,
          notes: 'Here is your Fuel!',
          deadline: origininatingTx.deadline,
          requestId: originId
        }
      )
    }
    case ACCEPT: {
      console.log('\n INVOKING ACCEPT CALL ****************************')
      // accept offer
      return ZomeCall(
        'holofuel',
        'transactions',
        'receive_payments_pending',
        {
          promises: originId
        }
      )
    }
    default:
      throw new Error('Error: No transaction TYPE was matched. Current transaction type : ', type)
  }
}

startTestConductor()
  .then(() => {
    connect({ url: 'ws://localhost:3400' }).then(({ callZome }) => {
      // //////////////////////////////////////////////////////////////////////////////////// //
      // Zome Call :
      const holochainZomeCall = (instance, zomeName, zomeFuncName, args) => {
        console.log('------------------------------------------------------------------')
        console.log(` ARGS for the current ${zomeFuncName.toUpperCase()} ZomeCall : `, args)
        console.log('------------------------------------------------------------------')
        try {
          return callZome(instance, zomeName, zomeFuncName)(args).then(r => {
            console.log(`${zomeFuncName.toUpperCase()} Zome Call SUCCESS!  Entry address : `, r)
            console.log('------------------------------------------------------------------- \n')
            return r
          })
            .catch(e => {
              console.log('****************************************************************** \n')
              console.log('*************************** !!!!!! ZOME_CALL ERROR OCCURED !!!!!! ************************ \n')
              console.log('ERROR :  ', e)
              console.log('****************************************************************** \n')
              console.log('****************************************************************** \n')
            })
        } catch (e) {
          console.log(`Error occured when connecting to HC CONDUCTOR. >>>>>>>>>>>> ERROR: (${e}) <<<<<<<<<<<<<<<<< `)
        }
      }

      // //////////////////////////////////////////////////////////////////////////////////// //
      // INPUT DATA:
      const agentScenarioFlow = async (agentNum) => {
        console.log(' \n\n\n\n *********************************************************************************************************** ')
        console.log(`                                       ${agentNum === AGENT_1 ? 'AGENT 1' : 'AGENT 2'} Scenario Flow `)
        console.log(' *********************************************************************************************************** ')
        let CURRENT_AGENT, COUNTERPARTY_AGENT
        if (agentNum === AGENT_1) {
          CURRENT_AGENT = AGENT_1
          COUNTERPARTY_AGENT = AGENT_2
        } else if (agentNum === AGENT_2) {
          CURRENT_AGENT = AGENT_2
          COUNTERPARTY_AGENT = AGENT_1
        } else {
          throw new Error('Invalid agent number provided : ', agentNum)
        }

        const halfArrayLength = (array) => Math.ceil((array.length - 1) / 2)
        const arrayFirstHalf = (array) => array.slice(0, halfArrayLength(array))
        const arraySecondHalf = (array) => array.slice(halfArrayLength(array))
        const halfRequestsLength = halfArrayLength(CURRENT_AGENT.requests)
        const forthRequestsLength = Math.ceil((halfRequestsLength) / 2)
        const halfInitiatingOffersLength = halfArrayLength(CURRENT_AGENT.offers.initated)

        // CASE 1 : Current Agent initiates 1/2 of total REQUESTS, counterparty pays, and current agent Accepts (full-tx-cycle requests)
        const fullRequestCycle = async () => {
          console.log(' \n\n ================================ CASE 1 : Full Request Cycle =========================================== ')
          console.log(' Length of all Initiated Requests: ', CURRENT_AGENT.requests.length)
          console.log(' Length of this cycle: ', arrayFirstHalf(CURRENT_AGENT.requests).length)
          for (let i = 0; i < arrayFirstHalf(CURRENT_AGENT.requests).length; i++) {
            await new Promise(resolve => {
              console.log('\n Full Request Array Iteration Number (index) : ', i)
              let txOriginId
              // Agent 1 Requests HF
              transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i })
              // Agent 2 Offers HF in response to Agent 1's request
                .then(r => {
                  const { Ok: originId } = JSON.parse(r)
                  txOriginId = originId
                  return transactHoloFuel(COUNTERPARTY_AGENT, PAY, holochainZomeCall, { transactionTrace: i, originId })
                })
                // Agent 1 Accepts HF offered by Agent 2 and completes originating Request
                .then(res => {
                  resolve(transactHoloFuel(CURRENT_AGENT, ACCEPT, holochainZomeCall, { originId: txOriginId }))
                })
                .catch(error => { return error })
            })
          }
        }

        // CASE 2 : Current Agent initiates the third forth of total REQUESTS & counterparty offers to pay (2/3 tx-cycle requests)
        const twoPartsRequestCycle = async () => {
          console.log('  \n\n ================================ CASE 2 : Two Parts Request Cycle =========================================== ')
          console.log(' Length of all Initiated Requests: ', CURRENT_AGENT.requests.length)
          console.log(' Length of this cycle: ', arrayFirstHalf(arraySecondHalf(CURRENT_AGENT.requests)).length)
          for (let i = 0; i < arrayFirstHalf(arraySecondHalf(CURRENT_AGENT.requests)).length; i++) {
            await new Promise(resolve => {
              i = i + halfRequestsLength
              console.log('\n Full Request Array Iteration Number (index) : ', i)
              console.log('\n MAKING CALL TO REQUEST')
              // Current Agent Requests HF
              transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i })
                // Transactee Agent Offers HF in response to Current Agent's request
                .then(r => {
                  const { Ok: originId } = JSON.parse(r)
                  resolve(transactHoloFuel(COUNTERPARTY_AGENT, PAY, holochainZomeCall, { transactionTrace: i, originId }))
                })
                .catch(error => { return error })
            })
          }
        }

        // CASE 3 : Current Agent initiates last forth of total REQUESTS & requests remain pending (1/3 tx-cycle requests)
        const onePartRequestCycle = async () => {
          console.log(' \n\n ================================== CASE 3 : One Part Request Cycle =========================================== ')
          console.log(' Length of all Initiated Requests: ', CURRENT_AGENT.requests.length)
          console.log(' Length of this cycle: ', arraySecondHalf(arraySecondHalf(CURRENT_AGENT.requests)).length)
          for (let i = 0; i < arraySecondHalf(arraySecondHalf(CURRENT_AGENT.requests)).length; i++) {
            await new Promise(resolve => {
              i = i + halfRequestsLength + forthRequestsLength
              console.log('\n Full Request Array Iteration Number (index) : ', i)
              // Current Agent Requests HF
              resolve(transactHoloFuel(CURRENT_AGENT, REQUEST, holochainZomeCall, { index: i }))
            })
              .catch(error => { return error })
          }
        }

        // CASE 4 : Current Agent initiates 1/2 of total PROMISES & counterparty Accepts them (full-tx-cycle offers)
        const fullOfferCycle = async () => {
          console.log(' \n\n ================================== CASE 4 : Full Offer Cycle =========================================== ')
          console.log(' Length of all Initiated Promises: ', CURRENT_AGENT.offers.initated.length)
          console.log(' Length of this cycle: ', arrayFirstHalf(CURRENT_AGENT.offers.initated).length)
          for (let i = 0; i < arrayFirstHalf(CURRENT_AGENT.offers.initated).length; i++) {
            await new Promise(resolve => {
              console.log('\n Full Offer Array Iteration Number (index) : ', i)
              // Current Agent Offers HF
              transactHoloFuel(CURRENT_AGENT, OFFER, holochainZomeCall, { index: i })
                // Transactee Accepts HF offered by Current Agent and completes originating Promise/Offer
                .then(r => {
                  const { Ok: originId } = JSON.parse(r)
                  resolve(transactHoloFuel(COUNTERPARTY_AGENT, ACCEPT, holochainZomeCall, { transactionTrace: i, originId }))
                })
                .catch(error => { return error })
            })
          }
        }

        // CASE 5 : Current Agent initiates 1/2 of total PROMISES & promises remain pending (1/2 tx-cycle offers)
        const halfOfferCycle = async () => {
          console.log(' \n\n ================================== CASE 5 : Half Offer Cycle =========================================== ')
          console.log(' Length of all Initiated Promises: ', CURRENT_AGENT.offers.initated.length)
          console.log(' Length of this cycle: ', arraySecondHalf(CURRENT_AGENT.offers.initated).length)
          for (let i = 0; i < arraySecondHalf(CURRENT_AGENT.offers.initated).length; i++) {
            await new Promise(resolve => {
              i = i + halfInitiatingOffersLength
              console.log('\n Full Offer Array Iteration Number (index) : ', i)

              console.log('\n arraySecondHalf(CURRENT_AGENT.offers.initated) : ', arraySecondHalf(CURRENT_AGENT.offers.initated))
              console.log('CURRENT_AGENT.offers.initated[INDEX] : ', CURRENT_AGENT.offers.initated[i])
              // Current Agent Offers HF
              resolve(transactHoloFuel(CURRENT_AGENT, OFFER, holochainZomeCall, { index: i }))
            })
              .catch(error => { return error })
          }
          process.exit()
        }

        await fullRequestCycle()
        await twoPartsRequestCycle()
        await onePartRequestCycle()
        await fullOfferCycle()
        await halfOfferCycle()
      }

      // agentScenarioFlow(AGENT_1)
      agentScenarioFlow(AGENT_2)
    }) // end of script
  })

// //////////////////////////////////////////////////////////////////////////////////// //

// HF ACTION FLOWS (for all successful cases):
// ===========================================
// AGENT 1 FLOW:
// >> Full Request Case
// >>>> Agent 1 Requests HF
// >>>> Agent 2 Offers HF (response to requested)
// >>>> Agent 1 Accepts Offered HF

// >> Full Promise Case
// >>>> Agent 1 Offers HF (initiated)
// >>>> Agent 2 Accepts Offered HF

// AGENT 2 FLOW:
// >> Full Request Case
// >>>> Agent 2 Requests HF
// >>>> Agent 1 Offers HF (response to requested)
// >>>> Agent 2 Accepts HF

// >> Full Promise Case
// >>>> Agent 2 Offers HF (initiated)
// >>>> Agent 1 Accepts Offered HF

// //////////////////////////////////////////////////////////////////////////////////// //
