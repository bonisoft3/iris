package database

import (
	schemas "bonisoft.org/libraries/mecha:tmpl"
)

"schema.hcl": {
	entities: [
		{
			name:   "hello"
			schema: schemas.Hello
		},
		{
			name:   "grouphello"
			schema: schemas.GroupHello
		},
	]
}
