using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IChat.Data;
//var key = Encoding.ASCII.GetBytes("ABBNbgINdtiZOci2sZSSaJZ2YyGmMMp6");

var builder = WebApplication.CreateBuilder(args);


var tokenSecret = builder.Configuration["Authentication:TokenSecret"];
var key = Encoding.ASCII.GetBytes(tokenSecret);

builder.Services.AddAuthentication(options =>
{
    // Set up default schemes for different contexts
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
   
}).AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        //IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Authentication:TokenSecret"]))

        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Extract JWT from query string for SignalR
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

//builder.Services.AddAuthorization();

builder.Services.AddDbContext<ChatContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ChatDbConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.WithOrigins("https://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddSignalR();


var app = builder.Build();
app.UseCors("AllowAllOrigins");

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles(); // Enables default files (e.g., index.html)
app.UseStaticFiles(); // Allows serving static files from wwwroot
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapFallbackToFile("/index.html");
app.MapHub<ChatHub>("/chathub");
app.MapControllers();

app.Run();
