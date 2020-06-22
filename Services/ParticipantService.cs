using Lotographia.Helpers;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

// modified from https://github.com/cornflourblue/aspnet-core-3-jwt-authentication-api/blob/master/Controllers/UsersController.cs
namespace Lotographia.Services
{
    public interface IParticipantService
    {
        string GetToken(string gameType, string participantId, string participantType);
    }

    public class ParticipantService : IParticipantService
    {
        private readonly AppSettings _appSettings;

        public ParticipantService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public string GetToken(string gameType, string participantId, string participantType)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimType.GameType, gameType),
                    new Claim(ClaimType.ParticipantId, participantId),
                    new Claim(ClaimType.ParticipantType, participantType)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class ClaimType
    {
        public const string GameType = "GameType";
        public const string ParticipantId = "ParticipantId";
        public const string ParticipantType = "ParticipantType";
    }

    public class GameType
    {
        public const string Mistletoe = "Mistletoe";
    }

    public class ParticipantType
    {
        public const string Player = "Player";
        public const string Admin = "Admin";
    }
}
