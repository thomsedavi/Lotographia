using Lotographia.Controllers.Requests;
using Lotographia.Data;
using Lotographia.Models;
using Lotographia.Services;
using Lotographia.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;

namespace Lotographia.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MistletoeController : ControllerBase
    {
        private readonly LotographiaContext _context;
        private readonly IParticipantService _participantService;
        private readonly PasswordHasher<MistletoeParticipant> _passwordHasher;

        public MistletoeController(IParticipantService participantService, LotographiaContext context)
        {
            _participantService = participantService;
            _context = context;
            _passwordHasher = new PasswordHasher<MistletoeParticipant>();
        }

        // POST: api/Mistletoe
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [AllowAnonymous]
        [HttpPost("game")]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Game(CreateGameRequest createGameRequest)
        {
            if (createGameRequest.ParticipantPassword != createGameRequest.ParticipantConfirmPassword)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { title = "Passwords don't match" });
            }

            if (!GameCodeUtils.TryCreateGameCode(_context, out string code))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = "Had difficulty creating a new game token :/ Try again?" });
            }

            var gameSettings = (createGameRequest.CanSeePreviousContent ? MistletoeGameSettings.CanSeePreviousContent : MistletoeGameSettings.None) |
                           (createGameRequest.CanSeeNextContent ? MistletoeGameSettings.CanSeeNextContent : MistletoeGameSettings.None) |
                           (createGameRequest.ParticipantsHaveBiographies ? MistletoeGameSettings.ParticipantsHaveBiographies : MistletoeGameSettings.None) |
                           (createGameRequest.PlayersRequireApproval ? MistletoeGameSettings.PlayersRequireApproval : MistletoeGameSettings.None) |
                           (createGameRequest.RandomlyOrderPlayers ? MistletoeGameSettings.RandomlyOrderPlayers : MistletoeGameSettings.None) |
                           (createGameRequest.AdminIsPlayer ? MistletoeGameSettings.AdminIsPlayer : MistletoeGameSettings.None);

            var mistletoeGame = new MistletoeGame
            {
                Title = createGameRequest.GameTitle.Trim(),
                Description = createGameRequest.GameDescription.Trim(),
                Code = code,
                Settings = gameSettings,
                CharacterLimit = createGameRequest.GameCharacterLimit,
            };

            _context.Add(mistletoeGame);

            var playerSettings = MistletoeParticipantSettings.IsAdmin |
                (createGameRequest.AdminIsPlayer ? MistletoeParticipantSettings.IsApprovedPlayer : MistletoeParticipantSettings.None);

            var mistletoeParticipant = new MistletoeParticipant
            {
                Name = createGameRequest.ParticipantName.Trim(),
                Biography = createGameRequest.ParticipantsHaveBiographies ? createGameRequest.ParticipantBiography.Trim() : null,
                Settings = playerSettings,
                MistletoeGame = mistletoeGame
            };

            if (!string.IsNullOrEmpty(createGameRequest.ParticipantPassword))
            {
                mistletoeParticipant.HashedPassword = _passwordHasher.HashPassword(mistletoeParticipant, createGameRequest.ParticipantPassword);
            }

            _context.Add(mistletoeParticipant);

            await _context.SaveChangesAsync();

            var participantToken = _participantService.GetToken(GameType.Mistletoe, mistletoeParticipant.Id.ToString(), ParticipantType.Admin);

            return StatusCode(StatusCodes.Status201Created, new
            {
                GameId = mistletoeGame.Id,
                GameCode = mistletoeGame.Code,
                ParticipantToken = participantToken,
                ParticipantId = mistletoeParticipant.Id
            });
        }

        [AllowAnonymous]
        [HttpPost("player")]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MistletoePlayer(CreatePlayerRequest createplayerRequest)
        {
            if (createplayerRequest.PlayerPassword != createplayerRequest.PlayerConfirmPassword)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { title = "Passwords don't match" });
            }

            var mistletoeGame = await _context.MistletoeGames
                .FirstOrDefaultAsync(g => g.Id == createplayerRequest.GameId);

            if (!string.Equals(mistletoeGame.Code, createplayerRequest.GameCode))
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game Id and Code don't match" });
            }

            var playerSettings = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.PlayersRequireApproval) ? MistletoeParticipantSettings.None : MistletoeParticipantSettings.IsApprovedPlayer;

            var mistletoePlayer = new MistletoeParticipant
            {
                Name = createplayerRequest.PlayerName.Trim(),
                Biography = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.ParticipantsHaveBiographies) && !string.IsNullOrEmpty(createplayerRequest.PlayerBiography.Trim()) ? createplayerRequest.PlayerBiography.Trim() : null,
                Settings = playerSettings,
                MistletoeGame = mistletoeGame
            };

            if (!string.IsNullOrEmpty(createplayerRequest.PlayerPassword))
            {
                mistletoePlayer.HashedPassword = _passwordHasher.HashPassword(mistletoePlayer, createplayerRequest.PlayerPassword);
            }

            _context.Add(mistletoePlayer);

            await _context.SaveChangesAsync();

            var playerToken = _participantService.GetToken(GameType.Mistletoe, mistletoePlayer.Id.ToString(), ParticipantType.Player);

            return StatusCode(StatusCodes.Status201Created, new
            {
                playerToken
            });
        }

        [HttpGet("participant")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Participant()
        {
            var user = HttpContext.User;

            var gameType = user.FindFirst(ClaimType.GameType).Value;

            if (gameType != GameType.Mistletoe)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { title = "wrong game type" });
            }

            var mistletoeParticipantId = int.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
            var mistletoeParticipant = await _context.MistletoeParticipants.FindAsync(mistletoeParticipantId);

            var mistletoeGame = await _context.MistletoeGames
                .Include(b => b.MistletoeParticipants)
                .FirstOrDefaultAsync(g => g.Id == mistletoeParticipant.MistletoeGameId);

            return StatusCode(StatusCodes.Status302Found, new {
                GameId = mistletoeGame.Id,
                GameCode = mistletoeGame.Code,
                ParticipantId = mistletoeParticipantId,
                IsAdmin = mistletoeParticipant.Settings.HasFlag(MistletoeParticipantSettings.IsAdmin),
                AdminIsPlayer = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.AdminIsPlayer),
                GameCharacterLimit = mistletoeGame.CharacterLimit,
                CanSeePreviousContent = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.CanSeePreviousContent),
                CanSeeNextContent = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.CanSeeNextContent),
                GameTitle = mistletoeGame.Title,
                GameDescription = mistletoeGame.Description,
                GameIsStarted = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.IsStarted),
                GameIsEnded = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.IsEnded),
                GameIsEnding = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.IsEnding),
                PlayersRequireApproval = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.PlayersRequireApproval),
                PartipantsHaveBiographies = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.ParticipantsHaveBiographies),
                IsApprovedPlayer = mistletoeParticipant.Settings.HasFlag(MistletoeParticipantSettings.IsApprovedPlayer),
                ParticipantName = mistletoeParticipant.Name,
                ParticipantBiography = mistletoeParticipant.Biography,
                Participants = mistletoeGame.MistletoeParticipants.Select(a => new {
                    a.Name,
                    a.Biography,
                    a.Id,
                    IsAdmin = a.Settings.HasFlag(MistletoeParticipantSettings.IsAdmin),
                    IsApproved = a.Settings.HasFlag(MistletoeParticipantSettings.IsApprovedPlayer)
                })
            });
        }

        [HttpPut("participant/{mistletoePlayerId}/approve")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ApprovePlayer(int mistletoePlayerId)
        {
            var user = HttpContext.User;

            var gameType = user.FindFirst(ClaimType.GameType).Value;
            var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

            if (gameType != GameType.Mistletoe || playerType != ParticipantType.Admin)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { title = "unauthorised sorry" });
            }

            var mistletoeAdminId = int.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
            var mistletoeAdmin = await _context.MistletoeParticipants.FindAsync(mistletoeAdminId);

            var mistletoePlayer = await _context.MistletoeParticipants.FindAsync(mistletoePlayerId);

            if (mistletoePlayer == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { title = "player not found" });
            }

            if (mistletoeAdmin.MistletoeGameId != mistletoePlayer.MistletoeGameId)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { title = "player is in wrong game" });
            }

            mistletoePlayer.Settings |= MistletoeParticipantSettings.IsApprovedPlayer;

            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new { title = "Player approved" });
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [Consumes(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var mistletoeParticipant = await _context.MistletoeParticipants.FindAsync(loginRequest.ParticipantId);

            if (mistletoeParticipant == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { title = "Player not found" });
            }

            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(mistletoeParticipant, mistletoeParticipant.HashedPassword, loginRequest.ParticipantPassword);

            if (passwordVerificationResult == PasswordVerificationResult.Failed)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { title = "Password bad" });
            }

            var playerToken = _participantService.GetToken(GameType.Mistletoe,
                mistletoeParticipant.Id.ToString(),
                mistletoeParticipant.Settings.HasFlag(MistletoeParticipantSettings.IsAdmin) ? ParticipantType.Admin : ParticipantType.Player);

            return StatusCode(StatusCodes.Status200OK, new
            {
                PlayerToken = playerToken
            });
        }

        [HttpPut("game/start")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> StartMistletoeGame()
        {
            var user = HttpContext.User;

            var gameType = user.FindFirst(ClaimType.GameType).Value;
            var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

            if (gameType != GameType.Mistletoe || playerType != ParticipantType.Admin)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { title = "Unauthorised Action" });
            }

            var mistletoeAdminId = int.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
            var mistletoeAdmin = await _context.MistletoeParticipants
                .Include(p => p.MistletoeGame)
                .FirstOrDefaultAsync(p => p.Id == mistletoeAdminId);

            mistletoeAdmin.MistletoeGame.Settings |= MistletoeGameSettings.IsStarted;

            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status200OK, new { title = "Game started" });
        }

        [AllowAnonymous]
        [HttpGet("game/{mistletoeGameId}/participants")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMistletoeParticipants(int mistletoeGameId)
        {
            var mistletoeGame = await _context.MistletoeGames
                .Include(b => b.MistletoeParticipants)
                .FirstOrDefaultAsync(g => g.Id == mistletoeGameId);

            if (mistletoeGame == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { title = "Game not found" });
            }

            return StatusCode(StatusCodes.Status302Found, new
            {
                Participants = mistletoeGame.MistletoeParticipants.Select(a => new
                {
                    a.Name,
                    a.Biography,
                    a.Id,
                    IsAdmin = a.Settings.HasFlag(MistletoeParticipantSettings.IsAdmin),
                    IsApproved = a.Settings.HasFlag(MistletoeParticipantSettings.IsApprovedPlayer)
                })
            });
        }

        // GET: api/mistletoe/5/players
        [AllowAnonymous]
        [HttpGet("code/{mistletoeGameCode}")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetGameFromCode(string mistletoeGameCode)
        {
            var mistletoeGame = await _context.MistletoeGames
                .FirstOrDefaultAsync(g => g.Code == mistletoeGameCode);

            if (mistletoeGame == null)
            {
                return StatusCode(StatusCodes.Status404NotFound, new { title = "Game not found" });
            }
            else
            {
                return StatusCode(StatusCodes.Status302Found, new {
                    mistletoeGame.Id,
                    mistletoeGame.Description,
                    mistletoeGame.CharacterLimit,
                    mistletoeGame.Title,
                    IsStarted = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.IsStarted),
                    IsEnded = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.IsEnded),
                    ParticipantsHaveBiographies = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.ParticipantsHaveBiographies),
                    PlayersRequireApproval = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.PlayersRequireApproval),
                    CanSeePreviousContent = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.CanSeePreviousContent),
                    CanSeeNextContent = mistletoeGame.Settings.HasFlag(MistletoeGameSettings.CanSeeNextContent)
                });
            }
        }
    }
}
