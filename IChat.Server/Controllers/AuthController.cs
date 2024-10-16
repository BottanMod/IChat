﻿using IChat.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using IChat.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IChat.Server.DTOs;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ChatContext _context;
    private readonly IConfiguration _config;

    public AuthController(ChatContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("signup")]
    public IActionResult Signup([FromBody] UserDto userDto)
    {
        if (userDto.Password != userDto.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match" });
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
        var user = new User { Username = userDto.Username, PasswordHash = hashedPassword };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { message = "User registered successfully" });
    }

   

    [HttpGet("users")]
    public IActionResult GetAllUsers()
    {
        var users = _context.Users.Select(u => new
        {
            Username = u.Username,
            
        }).ToList();

        return Ok(users);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        var user = _context.Users.SingleOrDefault(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var tokenSecret = _config["Authentication:TokenSecret"];
        if (string.IsNullOrEmpty(tokenSecret))
        {
            throw new InvalidOperationException("Token secret is not configured properly.");
        }
        var token = GenerateJwtToken(user, tokenSecret);
        return Ok(new { Token = token });
    }

    [HttpGet("get-users")]
    public IActionResult GetUsers()
    {
        var users = _context.Users.Select(u => new
        {
            Username = u.Username
        }).ToList();

        return Ok(users);
    }

    private static string GenerateJwtToken(User user, string secret)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
          new Claim(ClaimTypes.Name, user.Username),
          new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }



}