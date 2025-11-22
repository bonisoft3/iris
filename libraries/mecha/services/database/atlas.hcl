// Atlas configuration for declarative schema + migrations
env "default" {
  // Database URL - Atlas will connect via local socket during initialization
  url = "postgres://postgres:postgres@/postgres?host=/var/run/postgresql&sslmode=disable"
  
  // Development environment with schema source
  dev = "docker://postgres/18/dev"
  
  // Path to the declarative HCL schema directory (tables, extensions)
  src = "file:///schemas/"
  
  // Migration directory for SQL-based changes (roles, grants)
  migration {
    dir = "file:///migrations"
  }
  
  // Schema inspection settings
  schemas = ["public"]
}