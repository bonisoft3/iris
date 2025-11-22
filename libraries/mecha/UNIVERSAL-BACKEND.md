# Universal CRUD Backend Generator

Transform this Docker Compose stack into a universal CRUD backend for any entity by simply defining a protocol buffer schema. Generate all configurations, database schemas, API routes, and stream processing queries from a single source of truth.

## Overview

This system eliminates the need to write custom backend code for typical CRUD applications. Instead, you define your data model and business logic in a protocol buffer schema, and the system generates:

- ✅ PostgreSQL database schemas and migrations
- ✅ RESTful API endpoints via PostgREST
- ✅ Real-time streaming via Server-Sent Events
- ✅ Stream processing and aggregations via Arroyo
- ✅ Event-driven architecture via Dapr
- ✅ Hot reload development environment
- ✅ Complete observability stack

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Protocol      │    │   Generation     │    │   Running       │
│   Buffer        │───▶│   Engine         │───▶│   Backend       │
│   Schema        │    │   (CUE + Buf)    │    │   Services      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Components Generated

1. **Database Layer**
   - Table schemas with proper types and constraints
   - Indexes for performance
   - Triggers for audit fields (created_at, updated_at)
   - Default data seeding
   - Change Data Capture (CDC) setup

2. **API Layer**
   - RESTful CRUD endpoints
   - Custom business logic endpoints
   - Authentication and authorization
   - CORS configuration
   - Rate limiting

3. **Stream Processing**
   - Real-time event streams
   - Window-based aggregations
   - Message acknowledgments
   - Durable processing with Redis

4. **Infrastructure**
   - Service discovery and routing
   - Health checks and monitoring
   - Hot reload for development
   - Observability with metrics, logs, and traces

## Quick Start

### 1. Define Your Entity

Create a protocol buffer configuration in `configs/your-entity.textproto`:

```protobuf
entity {
  name: "product"
  display_name: "Products"
  description: "E-commerce product catalog"
  
  fields {
    name: "id"
    type: SQL_TYPE_UUID
    constraints { not_null: true }
  }
  
  fields {
    name: "name"
    type: SQL_TYPE_TEXT
    constraints { not_null: true }
    is_primary_content: true
  }
  
  fields {
    name: "price"
    type: SQL_TYPE_DECIMAL
    constraints { not_null: true }
  }
  
  fields {
    name: "category"
    type: SQL_TYPE_TEXT
  }
  
  indexes {
    name: "idx_product_category"
    fields: ["category"]
    type: INDEX_TYPE_BTREE
  }
}

database {
  name: "ecommerce"
  schema: "public"
  connection {
    host: "database"
    port: 5432
    username: "postgres"
    password: "postgres"
  }
}

api {
  base_path: "/api/v1"
  entity_path: "/products"
  
  custom_endpoints {
    path: "/products/by-category"
    method: "GET"
    description: "Get products grouped by category"
    sql_query: "SELECT category, COUNT(*) as count FROM product GROUP BY category"
  }
}

stream {
  enable_streaming: true
  
  aggregation {
    rules {
      name: "product_analytics"
      description: "Real-time product metrics"
      
      window {
        type: WINDOW_TYPE_TUMBLING
        interval: "5 minutes"
      }
      
      function {
        type: FUNCTION_TYPE_COUNT
      }
      
      output {
        table_name: "product_metrics"
        webhook_url: "http://crud:3000/product_metrics"
      }
      
      where_condition: "table_name = 'product' AND action = 'I'"
    }
  }
}
```

### 2. Generate Backend

```bash
./generate-backend.sh configs/product.textproto
```

This creates:
- `generated/migrations/product.sql` - Database schema
- `generated/openresty/nginx.conf` - API routing
- `generated/arroyo-queries/product_*.sql` - Stream processing
- `generated/dapr/components/` - Event infrastructure
- `generated/compose.override.yml` - Service configuration

### 3. Deploy

```bash
# Copy generated files (or use symlinks for development)
cp generated/migrations/* migrations/
cp generated/openresty/nginx.conf services/proxy/nginx.conf
cp generated/arroyo-queries/* services/arroyo/queries/
cp generated/dapr/components/* services/mesh/dapr/components/

# Start the backend
docker compose up --watch --build
```

### 4. Use Your API

```bash
# Create a product
curl -X POST http://localhost/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99, "category": "Electronics"}'

# Get all products
curl http://localhost/api/v1/products

# Get products by category (custom endpoint)
curl http://localhost/api/v1/products/by-category

# Stream real-time updates
curl http://localhost/stream/sse/product
```

## Configuration Schema

The protocol buffer schema (`schema/backend.proto`) defines all configurable aspects:

### Entity Definition
- **Fields**: Name, type, constraints, defaults
- **Indexes**: Performance optimization
- **Validation**: Business rules and constraints
- **Default Data**: Initial records

### Database Configuration
- **Connection**: Host, port, credentials
- **Migration**: Versioning and scripts
- **Replication**: CDC and event streaming

### API Configuration
- **Routing**: Base paths and entity endpoints
- **Authentication**: JWT, OAuth2, or none
- **Custom Endpoints**: Business-specific logic
- **CORS & Rate Limiting**: Security and performance

### Stream Processing
- **Windows**: Tumbling, sliding, or session-based
- **Aggregations**: Count, sum, string concatenation
- **Outputs**: Webhooks, SSE, database tables
- **Durability**: Redis streams for reliability

### Infrastructure
- **Services**: Names and discovery
- **Ports**: Network configuration
- **Health Checks**: Monitoring and reliability
- **Observability**: Metrics, logs, traces

## Advanced Features

### Custom Business Logic

Add SQL-based business logic without writing code:

```protobuf
custom_endpoints {
  path: "/products/trending"
  method: "GET"
  description: "Get trending products based on recent activity"
  sql_query: """
    SELECT p.*, COUNT(o.id) as order_count
    FROM product p
    JOIN order_items o ON p.id = o.product_id
    WHERE o.created_at > NOW() - INTERVAL '7 days'
    GROUP BY p.id
    ORDER BY order_count DESC
    LIMIT 10
  """
}
```

### Real-time Aggregations

Define complex windowed aggregations:

```protobuf
aggregation {
  rules {
    name: "revenue_tracking"
    description: "Track revenue by 5-minute windows"
    
    window {
      type: WINDOW_TYPE_TUMBLING
      interval: "5 minutes"
    }
    
    function {
      type: FUNCTION_TYPE_SUM
      target_field: "price"
    }
    
    output {
      table_name: "revenue_metrics"
      webhook_url: "http://analytics:8080/revenue"
      sse_channel: "/stream/revenue"
    }
  }
}
```

### Multi-Field Aggregations

Process multiple fields with custom SQL:

```protobuf
function {
  type: FUNCTION_TYPE_CUSTOM
  custom_sql: """
    json_build_object(
      'total_revenue', SUM(price * quantity),
      'avg_order_value', AVG(price * quantity),
      'product_count', COUNT(DISTINCT product_id)
    )
  """
}
```

## Development Workflow

### Hot Reload Development

The system supports hot reload for rapid iteration:

```bash
# Start with file watching
docker compose up --watch

# Edit your protocol buffer config
vim configs/my-entity.textproto

# Regenerate (in another terminal)
./generate-backend.sh configs/my-entity.textproto

# Copy updated files
cp generated/migrations/* migrations/
cp generated/openresty/nginx.conf services/proxy/nginx.conf

# Changes are automatically applied!
```

### Testing

Test your generated backend:

```bash
# Unit tests for generated SQL
cue vet codegen/sql.cue configs/my-entity.json

# Integration tests
docker compose exec crud curl http://localhost:3000/my-entity

# Stream processing tests
docker compose exec arroyo /queries/test-pipeline.sh
```

## Customization Examples

### E-commerce Platform

```protobuf
entity {
  name: "order"
  fields {
    name: "id"
    type: SQL_TYPE_UUID
  }
  fields {
    name: "customer_email"
    type: SQL_TYPE_TEXT
    constraints { not_null: true }
  }
  fields {
    name: "total_amount"
    type: SQL_TYPE_DECIMAL
    constraints { not_null: true }
  }
  fields {
    name: "status"
    type: SQL_TYPE_TEXT
    constraints {
      enum_values: ["pending", "paid", "shipped", "delivered", "cancelled"]
    }
  }
}

stream {
  aggregation {
    rules {
      name: "daily_sales"
      description: "Daily sales totals"
      window {
        type: WINDOW_TYPE_TUMBLING
        interval: "1 day"
      }
      function {
        type: FUNCTION_TYPE_SUM
        target_field: "total_amount"
      }
    }
  }
}
```

### Content Management

```protobuf
entity {
  name: "article"
  fields {
    name: "title"
    type: SQL_TYPE_TEXT
    is_primary_content: true
  }
  fields {
    name: "content"
    type: SQL_TYPE_TEXT
  }
  fields {
    name: "tags"
    type: SQL_TYPE_JSONB
  }
  fields {
    name: "published"
    type: SQL_TYPE_BOOLEAN
    default_value: "false"
  }
}

api {
  custom_endpoints {
    path: "/articles/published"
    method: "GET"
    sql_query: "SELECT * FROM article WHERE published = true ORDER BY created_at DESC"
  }
  custom_endpoints {
    path: "/articles/by-tag"
    method: "GET"
    sql_query: "SELECT * FROM article WHERE tags ? $1 ORDER BY created_at DESC"
  }
}
```

### IoT Data Platform

```protobuf
entity {
  name: "sensor_reading"
  fields {
    name: "device_id"
    type: SQL_TYPE_TEXT
  }
  fields {
    name: "temperature"
    type: SQL_TYPE_DECIMAL
    is_primary_content: true
  }
  fields {
    name: "humidity"
    type: SQL_TYPE_DECIMAL
  }
  fields {
    name: "location"
    type: SQL_TYPE_JSONB
  }
}

stream {
  aggregation {
    rules {
      name: "sensor_averages"
      window {
        type: WINDOW_TYPE_SLIDING
        interval: "1 hour"
      }
      function {
        type: FUNCTION_TYPE_AVG
        target_field: "temperature"
      }
    }
  }
}
```

## Migration from Existing Systems

### From REST APIs

1. Define your existing entities in protocol buffer format
2. Generate the new backend
3. Run both systems in parallel
4. Migrate data using the generated endpoints
5. Switch traffic to the new system

### From Monolithic Applications

1. Extract entity definitions from your ORM models
2. Convert business logic to SQL queries in custom endpoints
3. Replace real-time features with stream processing rules
4. Migrate incrementally, service by service

## Best Practices

### Entity Design
- Use UUIDs for primary keys (better for distributed systems)
- Always include `created_at` and `updated_at` fields
- Mark one field as `is_primary_content` for aggregations
- Use JSONB for flexible schema evolution

### API Design
- Follow RESTful conventions in entity paths
- Use custom endpoints for complex business logic
- Implement proper authentication and rate limiting
- Version your APIs with base paths

### Stream Processing
- Start with simple aggregations (count, sum)
- Use appropriate window sizes for your use case
- Implement idempotent processing where possible
- Monitor aggregation lag and adjust resources

### Performance
- Create indexes for frequently queried fields
- Use appropriate data types (don't over-engineer)
- Monitor query performance and add indexes as needed
- Consider partitioning for large tables

## Troubleshooting

### Common Issues

**Generation fails with CUE errors**
- Check your protocol buffer syntax
- Validate JSON conversion with `cue fmt`
- Ensure all required fields are present

**Database connection errors**
- Verify connection parameters in your config
- Check that services are running with `docker compose ps`
- Examine logs with `docker compose logs database`

**Stream processing not working**
- Check Arroyo pipeline status in the web UI (port 5115)
- Verify Redis streams with `docker compose exec redis redis-cli XINFO STREAM`
- Check webhook endpoints are reachable

**API returns 404s**
- Verify nginx configuration was regenerated
- Check that table exists in database
- Ensure PostgREST has proper permissions

### Debugging

```bash
# Check generated configurations
cue vet codegen/*.cue configs/your-entity.json

# Test database connection
docker compose exec database psql -U postgres -d your_db -c "\\dt"

# Monitor API requests
docker compose logs proxy

# Check stream processing
docker compose exec arroyo curl http://localhost:5115/api/v1/pipelines
```

## Contributing

This universal backend system is designed to be extensible:

### Adding New Database Types
1. Extend the `SqlType` enum in `backend.proto`
2. Add mapping in `codegen/sql.cue`
3. Update validation logic

### Supporting New Aggregation Functions
1. Add to `FunctionType` enum
2. Implement in `codegen/arroyo.cue`
3. Test with sample data

### Custom Authentication Providers
1. Extend `AuthType` enum
2. Add configuration in `AuthConfig`
3. Implement in nginx/Lua handlers

## Roadmap

- [ ] GraphQL API generation
- [ ] Multi-tenant support
- [ ] Advanced validation rules
- [ ] Performance optimization recommendations
- [ ] Automatic scaling based on load
- [ ] ML-based query optimization
- [ ] Visual schema designer
- [ ] Migration tools from popular frameworks

---

**Transform any data model into a production-ready backend in minutes, not months.** 🚀
