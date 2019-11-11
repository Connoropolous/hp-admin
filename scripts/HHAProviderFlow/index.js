const fs = require('fs')
const toml = require('toml')
const { connect } = require('@holochain/hc-web-client')
const startTestConductor = require('../startTestConductor.js')
const holochainZomeCall = require('../holochainZomeCall.js')
const HAPP_CONFIG = require('./HappConfig.js')

// DNA Instance Identifiers :
const config = toml.parse(fs.readFileSync('./conductor-config.toml', 'utf-8'))
// NOTE: Following alt var for the config file is for testing out with manual conductor(ie: not nix auto-gen)
// const config = toml.parse(fs.readFileSync('./hpadmin-conductor-config.toml', 'utf-8'))
const HAPP_STORE_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'happ-store').id
const HHA_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'holo-hosting-app').id

startTestConductor()
  .then(() => {
    console.log('Successful connection to Conductor!')
    connect({ url: 'ws://localhost:3400' }).then(({ callZome }) => {
      console.log('\n ************************************************************* ')
      console.log(' HAPP_STORE_DNA_INSTANCE : ', HAPP_STORE_DNA_INSTANCE)
      console.log(' HHA_DNA_INSTANCE : ', HHA_DNA_INSTANCE)
      console.log(' ************************************************************* \n')

      const PROVIDER_SHIMS = {
        // 1. Register Provider in hha
        registerAsProvider: () => {
          return new Promise((resolve, reject) => {
            const regProviderCall = holochainZomeCall(
              callZome,
              HHA_DNA_INSTANCE,
              'provider',
              'register_as_provider',
              {
                provider_doc: {
                  kyc_proof: 'TODO: This info is currently not required.'
                }
              }
            )
            resolve(regProviderCall)
          })
        },

        // 2. Create App in has
        createHapp: (happId) => {
          const happ = HAPP_CONFIG[happId]
          return holochainZomeCall(
            callZome,
            HAPP_STORE_DNA_INSTANCE,
            'happs',
            'create_app',
            {
              title: happ.title,
              description: happ.description,
              thumbnail_url: happ.thumbnail_url,
              homepage_url: happ.homepage_url,
              ui: happ.ui,
              dnas: happ.dna
            }
          )
        },

        // 3. Register App in hha
        registerHapp: (happStoreId, happId) => {
          const happ = HAPP_CONFIG[happId]

          return holochainZomeCall(
            callZome,
            HHA_DNA_INSTANCE,
            'provider',
            'register_app',
            {
              app_bundle: {
                happ_hash: happStoreId
              },
              domain_name: happ.domain
            }
          )
        },

        // Register Provider's HF account. > NB: currently adds dummy data
        addHolofuelAccount: () => holochainZomeCall(callZome, HHA_DNA_INSTANCE, 'provider', 'add_holofuel_account', { holofuel_account_details: { account_number: 'not currently used' } })
      }

      const registerProvider = new Promise((resolve) => resolve(PROVIDER_SHIMS.registerAsProvider()))
      const happConfigKeys = Object.keys(HAPP_CONFIG)
      const fillHappStore = () => {
        happConfigKeys.forEach(happId => {
          PROVIDER_SHIMS.createHapp(happId)
            .then(r => {
              const { Ok: happStoreId } = JSON.parse(r)
              PROVIDER_SHIMS.registerHapp(happStoreId, happId)
            })
            .catch(error => { return error })
        })
      }

      return registerProvider
        .then(_ => fillHappStore())
        .then(_ => PROVIDER_SHIMS.addHolofuelAccount())
        .then(_ => process.exit())
        .catch(e => console.log('Error when registering Provider. >> ERROR : ', e))
    }) // end of SHIMS
  })