package queries

import (
    schemas "bonisoft.org/libraries/mecha:tmpl"
    "strings"
)

helloName: "Hello"
groupHelloName: "GroupHello"

helloSchema: schemas.Hello
groupHelloSchema: schemas.GroupHello

// Extract business fields (non-standard fields) from the schema
helloBusinessFields: [
    for fieldName, fieldSchema in helloSchema.properties
    if fieldName != "id" && fieldName != "createdAt" && fieldName != "updatedAt" && fieldName != "created_at" && fieldName != "updated_at" {
        name: fieldName
        type: fieldSchema.type
    }
]

groupHelloBusinessFields: [
    for fieldName, fieldSchema in groupHelloSchema.properties
    if fieldName != "id" && fieldName != "createdAt" && fieldName != "updatedAt" && fieldName != "created_at" && fieldName != "updated_at" {
        name: fieldName
        type: fieldSchema.type
    }
]

// Get the first business field as primary field
helloPrimaryField: helloBusinessFields[0].name
groupHelloPrimaryField: groupHelloBusinessFields[0].name

"hello_aggregation.sql": {
    entity: {
        name:  helloName
        lower: strings.ToLower(helloName)
        primaryField: helloPrimaryField
    }
    aggregationEntity: {
        name:  groupHelloName
        lower: strings.ToLower(groupHelloName)
        primaryField: groupHelloPrimaryField
    }
    stream: {
        tableName: strings.ToLower(helloName)
        sseEndpoint: "/stream/sse/" + strings.ToLower(helloName)
    }
}
