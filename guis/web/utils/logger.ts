/* eslint-disable node/prefer-global/process */ // We are using process.server from NuxtJS which is injected into our code, eslint thinks we're trying to use https://nodejs.org/api/process.html
import pino from 'pino'

let opts

if (process.server) {
  opts = {
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime,
  }
}
else {
  opts = {
    transport: {
      targets: [{
        target: 'pino-pretty',
        level: 'trace',
        options: {},
      }],
    },
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime,
  }
}

const logger = pino(opts)

export default logger
