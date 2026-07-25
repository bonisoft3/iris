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
