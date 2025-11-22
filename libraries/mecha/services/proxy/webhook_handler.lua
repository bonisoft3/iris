-- webhook_handler.lua
-- Handles pgstream CDC webhooks and publishes to Redis streams
-- Used by: nginx.conf location /webhook

local cjson = require "cjson.safe"
local redis = require "resty.redis"

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
    ngx.log(ngx.ERR, "No body in webhook request")
    ngx.status = 400
    ngx.say("No body")
    return
end

-- Parse JSON payload
local payload = cjson.decode(body)
if not payload then
    ngx.log(ngx.ERR, "Invalid JSON in webhook")
    ngx.status = 400
    ngx.say("Invalid JSON")
    return
end

ngx.log(ngx.ERR, "DEBUG: Received webhook payload: ", cjson.encode(payload))

-- Extract data from pgstream webhook format
local data = payload.Data or payload
local table_name = data.table
local action = data.action

ngx.log(ngx.ERR, "DEBUG: table_name: ", tostring(table_name))
ngx.log(ngx.ERR, "DEBUG: action: ", tostring(action))

-- Single source of truth: Redis streams as event backbone
-- Both Dapr and Arroyo consume from the same stream
if table_name == "hello" and action then
    local red = redis:new()
    red:set_timeouts(1000, 1000, 1000)
    
    local ok, err = red:connect("redis", 6379)
    if not ok then
        ngx.log(ngx.ERR, "Failed to connect to Redis: ", err)
        ngx.status = 500
        ngx.say("Redis connection failed")
        return
    end
    
    -- Prepare event data for Redis streams (CDC path - no correlation guarantees)
    local event_data = {
        table_name = table_name,
        action = action,
        data = cjson.encode(data.columns or data.record or data.data or {}),
        timestamp = tostring(ngx.time()),
        source = "pgstream_cdc"
    }
    
    -- Create consumer groups for both Arroyo and Dapr (ignore errors if exist)
    red:xgroup("CREATE", "hello_stream", "arroyo_processors", "0", "MKSTREAM")
    red:xgroup("CREATE", "hello_stream", "dapr_event_handlers", "0", "MKSTREAM")
    
    -- Single atomic write to Redis stream
    local stream_fields = {}
    for k, v in pairs(event_data) do
        table.insert(stream_fields, k)
        table.insert(stream_fields, v)
    end
    
    local stream_id, err = red:xadd("hello_stream", "*", unpack(stream_fields))
    if not stream_id then
        ngx.log(ngx.ERR, "Failed to add to Redis stream: ", err)
        red:set_keepalive(30000, 100)
        ngx.status = 500
        ngx.say("Redis stream failed")
        return
    end
    
    red:set_keepalive(30000, 100)
    ngx.log(ngx.INFO, "Added to Redis stream (consumed by Arroyo + Dapr): ", stream_id)
end

ngx.status = 200
ngx.header.content_type = "application/json"
ngx.say('{"status": "ok"}')