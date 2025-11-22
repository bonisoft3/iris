@extern(embed)
package tmpl

import "strings"

// Export embedded JSON Schemas for downstream consumers.
Hello: _ @embed(file="gen/jsonschema/mecha.v1.Hello.jsonschema.json")
GroupHello: _ @embed(file="gen/jsonschema/mecha.v1.GroupHello.jsonschema.json")

_entityBase: [
	{name: "Hello", schema: Hello},
	{name: "GroupHello", schema: GroupHello},
]

Entities: [
	for entity in _entityBase {
		name: entity.name
		schema: entity.schema
		lower: strings.ToLower(entity.name)
		idPattern: entity.schema.properties.id.pattern | *"^[0-9a-fA-F%-]+$"
	}
]
