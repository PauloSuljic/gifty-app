using System.Runtime.CompilerServices;
using Serilog;
using System.Security.Claims;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using gifty_web_backend.Middlewares;
using gifty_web_backend.Utils;
using Gifty.Application.Common.Behaviors;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Domain.Interfaces;
using Google.Apis.Auth.OAuth2;
using Gifty.Infrastructure;
using Gifty.Infrastructure.Converters;
using Gifty.Infrastructure.Jobs;
using Gifty.Infrastructure.Repositories;
using Gifty.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

[assembly: InternalsVisibleTo("Gifty.Tests.Integration")]

var builder = WebApplication.CreateBuilder(args);

// ✅ Serilog (console sink + enricher)
builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration)
      .Enrich.FromLogContext()
      .Enrich.WithProperty("Application", "Gifty.Api")
      .WriteTo.Console();
});

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
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
    });
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
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IBirthdayReminderService, BirthdayReminderService>();
builder.Services.AddScoped<IImageStorageService, AzureBlobImageStorageService>();

builder.Services.AddHostedService<BirthdayReminderJob>();

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

builder.Services.AddHttpClient<IMetadataScraperService, MetadataScraperService>();

// ✅ 4. Auth Setup
if (builder.Environment.IsEnvironment("Testing") || builder.Configuration["UseTestAuth"] == "true")
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
            JwtBearerDefaults.AuthenticationScheme, _ => { });
}
else
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = "https://securetoken.google.com/gifty-auth-71f71";
            options.MetadataAddress = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                SignatureValidator = (token, _) =>
                {
                    // Use Firebase Admin SDK instead
                    FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token).GetAwaiter().GetResult();
                    return new JsonWebToken(token);
                }
            };
        });
}

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

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();

// ✅ Per-request logging with Serilog (status, route, timing)
app.UseSerilogRequestLogging(opts =>
{
    opts.EnrichDiagnosticContext = (diag, http) =>
    {
        diag.Set("CorrelationId", http.Response.Headers["X-Correlation-ID"].ToString());
        diag.Set("UserId", http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous");
    };
});

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
    try
    {
        Log.Information("Applying EF Core migrations (env={Environment})", app.Environment.EnvironmentName);
        if (db.Database.IsRelational())
        {
            db.Database.Migrate();
        }
        Log.Information("Database ready");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Database migration failed");
        throw;
    }
}

app.Run();