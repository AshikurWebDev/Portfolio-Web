In a multi-tenant system, one organization must never see another's rows. Not in a list, not in a report, not because one developer forgot a `Where` clause on a Friday evening. In the systems I build, that rule is enforced in one place, so forgetting is not possible.

::layer{id=api}

## Where the tenant comes from

Every request carries the signed-in user's organization as a claim in their token. A small service reads it once per request:

```csharp
public interface ITenantContext
{
    Guid TenantId { get; }
}

public sealed class HttpTenantContext(IHttpContextAccessor http) : ITenantContext
{
    public Guid TenantId =>
        Guid.TryParse(http.HttpContext?.User.FindFirstValue("tenant_id"), out var id)
            ? id
            : throw new UnauthorizedAccessException("No tenant on this request.");
}
```

The tenant id never comes from the URL or the request body, where a user could change it. It comes from the token the API issued and signed.

::figure{id=tenant-request caption="The tenant is read from the token once, then applied by the data layer to every query."}

::layer{id=data}

## One filter on every query

EF Core can attach a filter to an entity type that it adds to every query automatically. The DbContext takes the tenant context and applies the filter to every entity that belongs to a tenant:

```csharp
public sealed class ErpDbContext(DbContextOptions<ErpDbContext> options, ITenantContext tenant)
    : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Student>().HasQueryFilter(s => s.TenantId == tenant.TenantId);
        b.Entity<Invoice>().HasQueryFilter(i => i.TenantId == tenant.TenantId);
    }
}
```

Now `db.Students.ToListAsync()` only ever returns the current organization's students. So does every `Include`, every count and every report query built on top. A developer writing a new screen does not have to remember anything.

::figure{id=tenant-stack caption="Each layer only ever sees one organization's slice of the data."}

## Writes need the same care

Reads are filtered, but a new row still needs its tenant set. Instead of trusting each service to do it, the DbContext stamps it on save:

```csharp
public override Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    foreach (var entry in ChangeTracker.Entries<ITenantOwned>())
    {
        if (entry.State == EntityState.Added)
            entry.Entity.TenantId = tenant.TenantId;
        else if (entry.Property(e => e.TenantId).IsModified)
            throw new InvalidOperationException("A row cannot move to another tenant.");
    }
    return base.SaveChangesAsync(ct);
}
```

## When you need to see everything

Some jobs legitimately cross tenants: a platform admin screen, a nightly archive job. EF Core's `IgnoreQueryFilters()` turns the filter off for one query. I keep those calls rare, in clearly named services, and every one of them writes to the audit trail. A search for `IgnoreQueryFilters` across the codebase should return a short list.

::layer{id=logic}

## How I check it

A filter that is easy to forget to test is just a different way to forget. So there is one test per tenant-owned entity: seed rows for two tenants, query as tenant A, and assert that no row from tenant B comes back. When someone adds a new entity and forgets the filter, a test fails before the code ships.
