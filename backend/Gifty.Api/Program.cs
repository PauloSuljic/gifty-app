using System.Runtime.CompilerServices;
using FirebaseAdmin;
using gifty_web_backend.Utils;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Domain.Interfaces;
using Google.Apis.Auth.OAuth2;
using Gifty.Infrastructure;
using Gifty.Infrastructure.Repositories;
using Gifty.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

[assembly: InternalsVisibleTo("Gifty.Tests.Integration")]

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ✅ Load environment variables
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();

// ✅ 1. Read Connection String
if (builder.Environment.EnvironmentName != "Testing")
{
    var connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                           ?? configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        throw new Exception("❌ No connection string found!");
    }
    
    builder.Services.AddDbContext<GiftyDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// ✅ 2. Firebase Admin SDK
var useTestAuth = builder.Configuration["UseTestAuth"];

if (useTestAuth != "true")
{
    var firebaseJson = configuration["Firebase:CredentialsJson"];

    if (string.IsNullOrWhiteSpace(firebaseJson))
    {
        throw new Exception("❌ Firebase credentials not found.");
    }

    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromJson(firebaseJson)
        });
    }
}

// ✅ 3. Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(UserDto).Assembly)); 

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IWishlistItemRepository, WishlistItemRepository>();
builder.Services.AddScoped<ISharedLinkRepository, SharedLinkRepository>();
builder.Services.AddScoped<IFirebaseAuthService, FirebaseAuthService>();
builder.Services.AddScoped<ISharedLinkVisitRepository, SharedLinkVisitRepository>();

// ✅ 4. Auth Setup
#if DEBUG
if (builder.Configuration["UseTestAuth"] == "true")
{
    builder.Services.AddAuthentication("Test")
        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
}
else
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = "https://securetoken.google.com/gifty-auth-71f71";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "https://securetoken.google.com/gifty-auth-71f71",
                ValidateAudience = true,
                ValidAudience = "gifty-auth-71f71",
                ValidateLifetime = true
            };
        });
}
#else
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://securetoken.google.com/gifty-auth-71f71";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://securetoken.google.com/gifty-auth-71f71",
            ValidateAudience = true,
            ValidAudience = "gifty-auth-71f71",
            ValidateLifetime = true
        };
    });
#endif

builder.Services.AddAuthorization();

// ✅ 5. CORS
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGIN")?
                         .Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                     ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// ✅ 6. Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.EnvironmentName != "Testing")
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<GiftyDbContext>();
    if (db.Database.IsRelational())
    {
        db.Database.Migrate();
    }
}

app.Run();
