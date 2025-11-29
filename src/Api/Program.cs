var builder = WebApplication.CreateBuilder( args );

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if ( app.Environment.IsDevelopment() )
{
    app.MapOpenApi();
}

// Map API controllers first
app.MapControllers();

// Serve static files from wwwroot (React build output)
app.UseStaticFiles();

// SPA fallback - serve index.html for non-API routes
app.MapFallbackToFile( "index.html" );

app.Run();
