using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NetServer.Data
{
    public class AppDbContextFactory 
        : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseNpgsql(
                "Host=localhost;Port=5432;Database=Digital_Assets2026;Username=postgres;Password=bobataevelik"
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}