import React, { createContext, useContext, useState } from 'react'

export const ConnectionContext = createContext()

export function ConnectionProvider ({ children }) {
  const [isConnected, setIsConnected] = useState(false)

  return <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
    {children}
  </ConnectionContext.Provider>
}

export default function useConnectionContext () {
  return useContext(ConnectionContext)
}
