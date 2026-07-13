using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace LuminaLms.Infrastructure.Persistence;

/// <summary>Used only by `dotnet ef` design-time tooling (migrations add/script) — not part of the app's runtime DI.</summary>
public class LmsDbContextFactory : IDesignTimeDbContextFactory<LmsDbContext>
{
    public LmsDbContext CreateDbContext(string[] args)
    {
        // Checked in order: explicit design-time override, then the same env var
        // name ASP.NET Core's configuration binder uses for ConnectionStrings:Postgres
        // (so `$env:ConnectionStrings__Postgres = "..."` works for both `dotnet run`
        // and `dotnet ef`), then a local fallback for a from-scratch dev DB.
        var connectionString = Environment.GetEnvironmentVariable("LUMINA_DESIGN_TIME_CONNECTION")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? "Host=localhost;Database=lumina_design_time;Username=postgres;Password=postgres";
        connectionString = PostgresConnectionStringHelper.Normalize(connectionString);

        var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
        dataSourceBuilder.MapLmsEnums();
        var dataSource = dataSourceBuilder.Build();

        var optionsBuilder = new DbContextOptionsBuilder<LmsDbContext>();
        optionsBuilder.UseNpgsql(dataSource).UseSnakeCaseNamingConvention();

        return new LmsDbContext(optionsBuilder.Options);
    }
}
