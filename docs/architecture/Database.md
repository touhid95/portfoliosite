# Database

## Overview
The project uses Supabase as the database provider, relying on PostgreSQL for data persistence.

## Schema Highlights
- Please refer to `supabase_schema.sql` at the root for the exact table definitions and Row Level Security (RLS) policies.

## Integration
- Database connections are typically established in the `lib/` directory or directly in server actions/API routes within the [[Nextjs_App]].
- Interactions with the database are typically authenticated using Supabase Auth.
