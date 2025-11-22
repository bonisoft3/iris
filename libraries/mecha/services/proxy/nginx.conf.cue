package proxy

import (
	schemas "bonisoft.org/libraries/mecha:tmpl"
)

"nginx.conf": {
	entities: [
		for entity in schemas.Entities {
			name:          entity.name
			lower:         entity.lower
			primaryField:  "world"
			enableDaprEvents: true
			enableStream:    true
			daprRoute:      "/dapr-\(entity.lower)-events"
			stream: {
				pubsubChannel: "\(entity.lower)_processing_channel"
			}
		}
	]
}