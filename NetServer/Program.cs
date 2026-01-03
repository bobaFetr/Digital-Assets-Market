using Microsoft.EntityFrameworkCore;
using NetServer.Data;

var builder = WebApplication.CreateBuilder(args);

// Register DbContext with SQL Server
//AppDbContext
builder.Services.AddDbContext<NetServer.Data.AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Example endpoint: get all users from SQL Server
//AppDbContext
app.MapGet("/users", async (NetServer.Data.AppDbContext db) =>
{
    return await db.Users.ToListAsync();
});

app.Run();