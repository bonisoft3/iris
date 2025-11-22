-- sse_handler.lua
-- SSE endpoint with Redis streams consumer groups
-- Used by: nginx.conf location /stream/sse/hello

local cjson = require "cjson.safe"
local redis = require "resty.redis"

-- Set SSE headers
ngx.header["Content-Type"] = "text/event-stream"
ngx.header["Cache-Control"] = "no-cache"
ngx.header["Connection"] = "keep-alive"
ngx.header["Access-Control-Allow-Origin"] = "*"

-- Send initial SSE connection with ID
ngx.say("id: connection")
ngx.say("data: {\"type\": \"connected\"}")
ngx.say("")
ngx.flush(true)

-- Connect to Redis for streams
local red = redis:new()
red:set_timeouts(1000, 1000, 30000) -- 30s read timeout for blocking

local ok, err = red:connect("redis", 6379)
if not ok then
    ngx.log(ngx.ERR, "Failed to connect to Redis: ", err)
    ngx.say("data: {\"error\": \"Redis connection failed\"}")
    ngx.say("")
    ngx.flush(true)
    return
end

-- Get Last-Event-ID from request headers for resumption
local last_event_id = ngx.var.http_last_event_id
local stream_position
local heartbeat_counter = 0
local last_stream_id
local last_event_schema = nil

local function normalize_last_event_id(event_id)
    if not event_id or event_id == "" then
        return nil
    end
    local base = event_id:match("^(.-)|hb|%d+$")
    if base and base ~= "" then
        return base
    end
    return event_id
end

-- Determine starting position based on Last-Event-ID
if last_event_id and last_event_id ~= "" then
    -- Resume from after the last event ID (strip heartbeat suffix if present)
    stream_position = normalize_last_event_id(last_event_id)
    ngx.log(ngx.INFO, "Resuming from Last-Event-ID: ", last_event_id, " (normalized to ", stream_position, ")")
else
    -- No Last-Event-ID: read from beginning to avoid race condition
    stream_position = "0"
    ngx.log(ngx.INFO, "Starting from beginning (no Last-Event-ID, using '0')")
end

if stream_position ~= "0" then
    last_stream_id = stream_position
end

-- Read from Redis stream
while true do
    local res, err = red:xread("COUNT", "1", "BLOCK", "5000", "STREAMS", "hello_stream", stream_position)

    if err then
        ngx.log(ngx.ERR, "SSE_HANDLER_ERROR: XREAD error: ", err)
    elseif not res or res == ngx.null then
        heartbeat_counter = heartbeat_counter + 1
        local base_id = last_stream_id or stream_position or "0-0"
        local heartbeat_id = string.format("%s|hb|%06d", base_id, heartbeat_counter)

        -- Send heartbeat using schema from last real event
        if last_event_schema then
            local heartbeat_event = {
                table_name = "heartbeat",
                action = "H",
                timestamp = math.floor(ngx.now() * 1000),
                stream_id = heartbeat_id,
                heartbeat = true
            }

            -- Add all fields from last event schema with null values
            for field_name, _ in pairs(last_event_schema) do
                heartbeat_event[field_name] = ngx.null
            end

            ngx.say("id: " .. heartbeat_id)
            ngx.say("data: " .. cjson.encode(heartbeat_event))
            ngx.say("")
            ngx.flush(true)
            ngx.log(ngx.INFO, "Sent heartbeat event " .. heartbeat_id .. " with schema from last event")
        else
            -- Fallback: minimal heartbeat if no real events yet
            ngx.say("id: " .. heartbeat_id)
            ngx.say(": keepalive")
            ngx.say("")
            ngx.flush(true)
            ngx.log(ngx.INFO, "Sent minimal heartbeat " .. heartbeat_id .. " (no schema available yet)")
        end
    elseif type(res) == "table" and res[1] and res[1][2] and res[1][2][1] then
        local stream_data = res[1][2][1]
        local message_id = stream_data[1]
        local fields = stream_data[2]

        local event = {}
        for i = 1, #fields, 2 do
            event[fields[i]] = fields[i + 1]
        end

        -- Build SSE event with dynamic field extraction
        local sse_event = {
            table_name = event.table_name,
            action = event.action,
            timestamp = tonumber(event.timestamp),
            stream_id = message_id
        }

        -- Extract all fields dynamically and capture schema
        local current_schema = {}
        if event.data then
            local data_array = cjson.decode(event.data)
            if data_array then
                for _, field in ipairs(data_array) do
                    local field_key = field.name .. "_value"
                    sse_event[field_key] = field.value
                    current_schema[field_key] = true
                end
                -- Update schema for future heartbeats
                last_event_schema = current_schema
            end
        end

        ngx.say("id: " .. message_id)
        ngx.say("data: " .. cjson.encode(sse_event))
        ngx.say("")
        ngx.flush(true)

        stream_position = message_id
        last_stream_id = message_id
        heartbeat_counter = 0
    else
        ngx.say(": keepalive")
        ngx.say("")
        ngx.flush(true)
    end
    
    if ngx.var.connection_requests == nil then
        break
    end
end

red:set_keepalive(30000, 100)
