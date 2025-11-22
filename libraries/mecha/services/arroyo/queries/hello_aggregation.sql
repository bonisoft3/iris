-- vim: set filetype=sql:
-- Windowed aggregation query for concatenating last 3 hello messages
-- Uses updating semantics for immediate emission when COUNT >= 3

-- Create source table from SSE
CREATE TABLE hello_events (
    message_value TEXT,
    table_name TEXT,
    action TEXT,
    timestamp BIGINT,
    stream_id TEXT
) WITH (
    connector = 'sse',
    endpoint = 'http://proxy/stream/sse/hello',
    format = 'json'
);

-- Create output sink for aggregated results (using webhook to call PostgREST)
CREATE TABLE grouphello_output (
    messages TEXT
) WITH (
    connector = 'webhook',
    endpoint = 'http://crud:3000/grouphello',
    headers = 'Content-Type:application/json',
    format = 'json'
);

-- Count-based aggregation - emits final result when window closes
-- Uses hop window to create non-updating append-only output
INSERT INTO grouphello_output
SELECT
    string_agg(message_value, ', ') as messages
FROM hello_events
WHERE action = 'I' AND table_name = 'hello'
GROUP BY hop(interval '1' second, interval '1' second)
HAVING COUNT(*) >= 2;