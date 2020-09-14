import { app, Menu, Tray } from 'electron'
import * as http from 'http'
import * as https from 'https'
import { main } from '../src/main'

let tray: Tray

const getAddress = (server: http.Server | https.Server): string => {
  const address = server.address()
  if (!address) {
    return ''
  }

  if (typeof address === 'string') {
    return address
  }

  return `${address.address}:${address.port}`
}

const start = async () => {
  //* Start Server
  const server = await main()

  //* Configure Tray Icon
  tray = new Tray('assets/tray-icon.png')
  tray.setToolTip('Proxyscotch is running')
  const menu = Menu.buildFromTemplate([
    {
      label: `Proxyscotch is runninng on ${getAddress(server)}`,
    },
    {
      type: 'normal',
      label: 'Exit',
      role: 'quit',
    },
  ])
  tray.setContextMenu(menu)
}

app.on('ready', start)
