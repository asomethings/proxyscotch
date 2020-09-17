import * as yargs from 'yargs'
import { App } from './app'

export const main = () => {
  const argv = yargs
    .env('PROXYSCOTCH')
    .usage('$0', 'Starts server')
    .option('host', {
      type: 'string',
      default: '127.0.0.1',
      description: 'Hostname of server',
    })
    .option('port', {
      type: 'number',
      default: 80,
      description: 'Port of server',
    })
    .option('token', { type: 'string', demandOption: false })
    .option('allowed-origins', {
      type: 'string',
      array: true,
      default: [],
      description: 'Array of allowed origins',
    })
    .option('banned-outputs', {
      type: 'string',
      array: true,
      default: [],
      description: 'Array of banned outputs',
    })
    .command('ssl', 'Run server with SSL Options', (yargs) => {
      return yargs
        .option('key', { type: 'string', demandOption: true })
        .option('cert', { type: 'string', demandOption: true })
        .option('passphrase', { type: 'string', demandOption: false })
    })
    .version()
    .help().argv

  const app = new App({
    token: argv.token,
    host: argv.host,
    port: argv.port,
    allowedOrigins: argv['allowed-origins'],
    bannedOutputs: argv['banned-outputs'],
    ssl: {
      key: argv.key,
      cert: argv.cert,
    },
  })

  return app.listen()
}

if (require.main === module) {
  main()
}
