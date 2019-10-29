// Note, this is not really a config file. It's just a way for the JS to access the nix config
// import config from '/Users/robbiecarlton/holo/hp-admin5/conductor-config.toml'
import config from 'utils/conductor-config.toml'

export function getAgent (index = 0) {
  if (index >= config.agents.length) throw new Error(`There are less than ${index - 1} agents in the config`)
  return {
    id: config.agents[index].public_address,
    nickname: config.agents[index].name,
    conductorId: config.agents[index].id
  }
}

export function findInstanceForAgent (instanceId, agentIndex = 0) {
  const agent = getAgent(agentIndex)

  console.log('config.instances', config.instances)

  const instance = config.instances.find(instance => instance.dna === instanceId && instance.agent === agent.conductorId)
  if (!instance) throw new Error(`No instance found for id ${instanceId} and agent ${agent.conductorId}`)
  return instance
}
