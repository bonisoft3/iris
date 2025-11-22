-- redis_streams_events_handler.lua
-- Handles Redis streams events from Dapr binding for business logic
-- Used by: nginx.conf location /redis-streams-events

local cjson = require "cjson.safe"

-- Validate HTTP method
if ngx.var.request_method ~= "POST" then
    ngx.status = 405
    ngx.say("Method not allowed")
    return
end

-- Read and validate request body
ngx.req.read_body()
local body = ngx.req.get_body_data()
if not body then
    ngx.status = 400
    ngx.say("No body")
    return
end

-- Parse Dapr binding event
local binding_event = cjson.decode(body)
if not binding_event then
    ngx.status = 400
    ngx.say("Invalid JSON")
    return
end

-- Process Redis streams event from Dapr binding
ngx.log(ngx.INFO, "Dapr received Redis streams event: ", cjson.encode(binding_event))

-- Extract event data and handle business logic
local data = binding_event.data
if data and data.table_name == "hello" then
    -- Here you would implement your event-driven business logic
    -- Examples: send notifications, update aggregates, trigger workflows
    ngx.log(ngx.INFO, "Processing hello event for business logic: ", data.action)
end

ngx.status = 200
ngx.header.content_type = "application/json"
ngx.say('{"status": "processed"}')