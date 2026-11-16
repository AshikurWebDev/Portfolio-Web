I build on both databases. The coaching center ERP runs on SQL Server; the land syndicate SaaS is built on PostgreSQL with PostGIS. People ask which one is better for an ERP. My honest answer is that the system's job decides, and these are the questions I ask.

::layer{id=data}

## The questions, not the brand

::figure{id=db-choice caption="The same four questions, answered for two different systems."}

**Where will it run, and who pays for it?** A single organization's ERP on its own server is a different problem from a SaaS that hosts many organizations in the cloud. For a SaaS, a licence-free database that runs well in Linux containers keeps the hosting bill predictable as tenants grow.

**What shape is the data?** Fees, attendance and exams are classic relational data: students, classes, invoices, payments, with strict foreign keys between them. Either database handles that well. The syndicate platform also stores land parcels as shapes on a map, and PostGIS is the deciding feature there: spatial types, indexes and functions that answer "which parcels touch this road?" in SQL.

**What does the team already know?** A database the team can tune, back up and restore at 2 a.m. beats a theoretically better one nobody has operated.

**How will reports be built?** ERP users live in reports. Both databases have strong query planners and window functions; what matters more is that the schema was designed for the reports from the start.

## What stays the same either way

Most of the work does not depend on the engine at all:

| Concern | How I handle it | Engine-specific? |
| --- | --- | --- |
| Data access | EF Core, with the SQL Server or Npgsql provider | Provider only |
| Tenant isolation | EF Core global query filters | No |
| Audit trail | History rows written on every change | No |
| Migrations | EF Core migrations, reviewed as SQL | Generated SQL differs |
| Spatial data | `geography` in SQL Server, PostGIS in PostgreSQL | Yes |

Because EF Core sits in between, moving a module from one engine to the other is mostly a provider change plus checking the generated SQL. The places that do not move cleanly are the ones that use engine-specific features, which is exactly why I keep those few and in clearly named places.

::layer{id=logic}

## Where the differences show up in code

A small example: inserting a row only if it does not exist yet, which the attendance sync needs for every punch.

```sql
-- PostgreSQL
INSERT INTO attendance_punch (device_serial, device_user_id, punched_at)
VALUES (@serial, @userId, @at)
ON CONFLICT (device_serial, device_user_id, punched_at) DO NOTHING;
```

```sql
-- SQL Server
INSERT INTO attendance_punch (device_serial, device_user_id, punched_at)
SELECT @serial, @userId, @at
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_punch
    WHERE device_serial = @serial AND device_user_id = @userId AND punched_at = @at
);
```

Same intent, different syntax. Differences like this are real but small, and they are not a reason to pick one engine over the other.

## My rule of thumb

Pick the engine that fits where the system runs and what its data looks like, design the schema around the reports people need, and keep engine-specific code in a few known places. The database should be a decision you can explain in two sentences, not a loyalty.
