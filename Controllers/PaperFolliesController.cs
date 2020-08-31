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
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Lotographia.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaperFolliesController : ControllerBase
    {
        private readonly LotographiaContext _context;
        private readonly IParticipantService _participantService;
        private readonly PasswordHasher<PaperFolliesParticipant> _passwordHasher;

        public PaperFolliesController(IParticipantService participantService, LotographiaContext context)
        {
            _participantService = participantService;
            _context = context;
            _passwordHasher = new PasswordHasher<PaperFolliesParticipant>();
        }

        [HttpGet("participant")]
        public async Task<IActionResult> GetParticipant()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "wrong game type" });
                }

                var participantId = long.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
                var participant = await _context.PaperFolliesParticipants
                    .Include(p => p.PrecedingPlayer)
                    .Include(p => p.FollowingPlayer)
                    .FirstOrDefaultAsync(p => p.Id == participantId);

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    Game = ToGameObject(game),
                    Participant = ToParticipantObject(participant),
                    Participants = game.Participants.Select(p => ToParticipantAttributesObject(p)),
                    precedingPlayerState = new {
                        Content = participant.PrecedingPlayer?.Content ?? "",
                        ContentVersion = participant.PrecedingPlayer?.ContentVersion ?? 0
                    },
                    FollowingPlayerState = new {
                        Content = participant.FollowingPlayer?.Content ?? "",
                        ContentVersion = participant.FollowingPlayer?.ContentVersion ?? 0
                    },
                    FinalContents = game.Flags.HasFlag(PaperFolliesGameFlags.IsEnded) ?
                    game.Players.OrderBy(a => a.ContentIndex).Select(p => p.Content) :
                    new List<string> { }
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("player/state")]
        public async Task<IActionResult> GetPlayerState(int precedingContentVersion, int followingContentVersion)
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "unauthorised sorry" });
                }

                var playerId = long.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
                var player = await _context.PaperFolliesParticipants
                    .Include(p => p.PrecedingPlayer)
                    .Include(p => p.FollowingPlayer)
                    .FirstOrDefaultAsync(p => p.Id == playerId);

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames.FindAsync(gameId);

                if (!player.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdded) ||
                    !game.Flags.HasFlag(PaperFolliesGameFlags.IsStarted))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "not allowed" });
                }

                // return empty string if update isn't available
                var precedingPlayerContent = player.PrecedingPlayer?.ContentVersion > precedingContentVersion ? player.PrecedingPlayer.Content : "";
                var followingPlayerContent = player.FollowingPlayer?.ContentVersion > followingContentVersion ? player.FollowingPlayer.Content : "";

                return StatusCode(StatusCodes.Status200OK, new {
                    GameState = ToGameStateObject(game),
                    PrecedingPlayerState = new
                    {
                        Content = precedingPlayerContent,
                        ContentVersion = player.PrecedingPlayer?.ContentVersion ?? 0
                    },
                    FollowingPlayerState = new
                    {
                        Content = followingPlayerContent,
                        ContentVersion = player.FollowingPlayer?.ContentVersion ?? 0
                    }
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("admin/state")]
        public async Task<IActionResult> GetAdminState(int precedingContentVersion, int followingContentVersion)
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var adminId = long.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
                var admin = await _context.PaperFolliesParticipants
                    .Include(p => p.PrecedingPlayer)
                    .Include(p => p.FollowingPlayer)
                    .FirstOrDefaultAsync(p => p.Id == adminId);

                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == admin.GameId);

                // return empty string if update isn't available
                var precedingPlayerContent = admin.PrecedingPlayer?.ContentVersion > precedingContentVersion ? admin.PrecedingPlayer?.Content : "";
                var followingPlayerContent = admin.FollowingPlayer?.ContentVersion > followingContentVersion ? admin.FollowingPlayer?.Content : "";

                return StatusCode(StatusCodes.Status200OK, new
                {
                    PlayerSummaries = game.Players.Select(p => ToPlayerSummaryObject(p)),
                    PrecedingPlayerState = new
                    {
                        Content = precedingPlayerContent,
                        ContentVersion = admin.PrecedingPlayer?.ContentVersion ?? 0
                    },
                    FollowingPlayerState = new
                    {
                        Content = followingPlayerContent,
                        ContentVersion = admin.FollowingPlayer?.ContentVersion ?? 0
                    }
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("game/download/text")]
        public async Task<IActionResult> GetBackupText()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var participantType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "unauthorised sorry" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames
                    .Include(g => g.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                if (!game.Flags.HasFlag(PaperFolliesGameFlags.IsEnded) && participantType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "unauthorised sorry" });
                }

                var admin = game.Participants.FirstOrDefault(p => p.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdmin));

                MemoryStream memoryStream = new MemoryStream();
                TextWriter tw = new StreamWriter(memoryStream);

                tw.WriteLine(game.Title);

                if (!string.IsNullOrEmpty(game.Description))
                {
                    tw.WriteLine("");

                    string[] lines = game.Description.Split(
                        new[] { Environment.NewLine },
                        StringSplitOptions.None
                    );

                    foreach (var line in lines)
                    {
                        tw.WriteLine(line);
                    }
                }

                tw.WriteLine("");
                tw.WriteLine("");

                foreach (var player in game.Players.OrderBy(p => p.ContentIndex))
                {
                    tw.WriteLine($"--- Player {player.ContentIndex}: {player.Name} ---");
                    tw.WriteLine("");

                    if (!string.IsNullOrEmpty(player.Content))
                    {
                        string[] lines = player.Content.Split(
                            new[] { Environment.NewLine },
                            StringSplitOptions.None
                        );

                        foreach (var line in lines)
                        {
                            tw.WriteLine(line);
                        }
                    }

                    tw.WriteLine("");
                }

                tw.WriteLine("");

                if (game.Flags.HasFlag(PaperFolliesGameFlags.ParticipantsHaveBiographies) &&
                    (game.Players.Any(p => !string.IsNullOrEmpty(p.Biography)) ||
                    !string.IsNullOrEmpty(admin.Biography)))
                {
                    tw.WriteLine($"BIOGRAPHIES");
                    tw.WriteLine($"");

                    foreach (var player in game.Players.OrderBy(p => p.ContentIndex))
                    {
                        if (!string.IsNullOrEmpty(player.Biography))
                        {
                            tw.WriteLine($"{player.Name}");

                            string[] lines = player.Biography.Split(
                                new[] { Environment.NewLine },
                                StringSplitOptions.None
                            );

                            foreach (var line in lines)
                            {
                                tw.WriteLine(line);
                            }

                            tw.WriteLine("");
                        }
                    }

                    if (!admin.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdded) &&
                        !string.IsNullOrEmpty(admin.Biography))
                    {
                        tw.WriteLine($"ADMIN: {admin.Name}");

                        string[] lines = admin.Biography.Split(
                            new[] { Environment.NewLine },
                            StringSplitOptions.None
                        );

                        foreach (var line in lines)
                        {
                            tw.WriteLine(line);
                        }

                        tw.WriteLine("");
                    }
                }

                tw.WriteLine("");
                tw.WriteLine("META");
                tw.WriteLine($"Created data: {game.CreatedDate.ToLongDateString()}");
                tw.WriteLine($"Ended data: {game.EndedDate?.ToLongDateString() ?? "N/A"}");
                tw.WriteLine($"Code: {game.Code}");
                tw.WriteLine($"Character Limit: {game.CharacterLimit}");
                tw.WriteLine($"{(game.Flags.HasFlag(PaperFolliesGameFlags.CanSeePrecedingContent) ? "Can" : "Cannot")} see preceding content");
                tw.WriteLine($"{(game.Flags.HasFlag(PaperFolliesGameFlags.CanSeeFollowingContent) ? "Can" : "Cannot")} see following content");

                tw.Flush();
                tw.Close();

                return File(memoryStream.GetBuffer(), "text/plain", "file.txt");
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("participant/{playerId}/add")]
        public async Task<IActionResult> PutAddPlayer(long playerId)
        {
            try
            {
                var user = HttpContext.User;

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var participantType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || participantType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "unauthorised sorry" });
                }

                var player = await _context.PaperFolliesParticipants.FindAsync(playerId);

                if (player == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "player not found" });
                }

                if (gameId != player.GameId)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "player is in wrong game" });
                }

                if (player.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdded))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "player already added" });
                }

                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                player.Flags |= PaperFolliesParticipantFlags.IsAdded;
                player.ContentIndex = !game.Flags.HasFlag(PaperFolliesGameFlags.RandomlyOrderPlayers)
                    ? game.Players.Count() : 0;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new { player.ContentIndex });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("game/start/player")]
        public async Task<IActionResult> GetStartGamePlayer()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Player)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                if (!game.Flags.HasFlag(PaperFolliesGameFlags.IsStarted))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game not started" });
                }

                return StatusCode(StatusCodes.Status200OK, new
                {
                    Participants = game.Players.Select(p => ToParticipantAttributesObject(p))
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("game/start/admin")]
        public async Task<IActionResult> PutStartGameAdmin()
        {
            try
            {
                var user = HttpContext.User;

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                IEnumerable<PaperFolliesParticipant> players = game.Players;

                if (game.Flags.HasFlag(PaperFolliesGameFlags.RandomlyOrderPlayers))
                {
                    players = players.OrderBy(p => p.HashedPassword);
                }
                else
                {
                    players = players.OrderBy(p => p.ContentIndex);
                }

                var playerList = players.ToList();

                for (var x = 0; x < playerList.Count; x++)
                {
                    var player = playerList[x];
                    player.ContentIndex = x + 1;

                    if (game.Flags.HasFlag(PaperFolliesGameFlags.CanSeeFollowingContent))
                    {
                        if (x < playerList.Count - 1)
                        {
                            player.FollowingPlayer = playerList[x + 1];
                        }
                        else
                        {
                            player.FollowingPlayer = playerList[0];
                        }
                    }

                    if (game.Flags.HasFlag(PaperFolliesGameFlags.CanSeePrecedingContent))
                    {
                        if (x > 0)
                        {
                            player.PrecedingPlayer = playerList[x - 1];
                        }
                        else
                        {
                            player.PrecedingPlayer = playerList[^1];
                        }
                    }
                }

                game.Flags |= PaperFolliesGameFlags.IsStarted;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new
                {
                    Participants = game.Participants.Select(p => ToParticipantAttributesObject(p))
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("game/begin-ending")]
        public async Task<IActionResult> PutBeginEndingGame()
        {
            try
            {
                var user = HttpContext.User;

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var game = await _context.PaperFolliesGames.FindAsync(gameId);

                game.Flags |= PaperFolliesGameFlags.IsEnding;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("game/end")]
        public async Task<IActionResult> PutEndGame()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);

                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                if (game.Players.Any(p => p.ContentVersion == 0))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Not all players have contributed content" });
                }

                foreach (var player in game.Players)
                {
                    player.Flags |= PaperFolliesParticipantFlags.IsEnded;
                }

                game.Flags |= PaperFolliesGameFlags.IsEnding;
                game.Flags |= PaperFolliesGameFlags.IsEnded;
                game.EndedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new
                {
                    FinalContents = game.Players.OrderBy(a => a.ContentIndex).Select(p => p.Content)
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("game/final")]
        public async Task<IActionResult> GetFinalGame()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);

                var game = await _context.PaperFolliesGames
                    .Include(p => p.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                if (!game.Flags.HasFlag(PaperFolliesGameFlags.IsEnded))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game is not ended" });
                }

                return StatusCode(StatusCodes.Status200OK, new
                {
                    FinalContents = game.Players.OrderBy(a => a.ContentIndex).Select(p => p.Content)
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("game/share")]
        public async Task<IActionResult> PutShareGame()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;
                var playerType = user.FindFirst(ClaimType.ParticipantType).Value;

                if (gameType != GameType.PaperFollies || playerType != ParticipantType.Admin)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Unauthorised Action" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames.FindAsync(gameId);

                game.Flags |= PaperFolliesGameFlags.IsShared;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("final/code/{gameCode}")]
        public async Task<IActionResult> GetFinalFromCode(string gameCode)
        {
            try
            {
                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Code == gameCode);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game not found" });
                }
                else if (!game.Flags.HasFlag(PaperFolliesGameFlags.IsShared))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game not shared" });
                }
                else
                {
                    return StatusCode(StatusCodes.Status200OK, new
                    {
                        Game = ToGameObject(game),
                        FinalContents = game.Players.OrderBy(a => a.ContentIndex).Select(p => p.Content),
                        Participants = game.Participants.Select(p => ToParticipantAttributesObject(p))
                    });
                }
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpPut("participant/content")]
        public async Task<IActionResult> PutParticipantContent(PutContentRequest putContentRequest)
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "wrong game type" });
                }

                var participantId = long.Parse(user.FindFirst(ClaimType.ParticipantId).Value);
                var participant = await _context.PaperFolliesParticipants
                    .Include(p => p.Game)
                    .FirstOrDefaultAsync(p => p.Id == participantId);

                if (!participant.Game.Flags.HasFlag(PaperFolliesGameFlags.IsStarted) ||
                    participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsEnded))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "invalid action" });
                }

                participant.Content = putContentRequest.Content;
                participant.ContentVersion += 1;

                if (participant.Game.Flags.HasFlag(PaperFolliesGameFlags.IsEnding) || putContentRequest.IsFinal)
                {
                    participant.Flags |= PaperFolliesParticipantFlags.IsEnded;
                }

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        // POST: api/PaperFollies
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [AllowAnonymous]
        [HttpPost("game")]
        public async Task<IActionResult> PostGame(CreateGameRequest createGameRequest)
        {
            try
            {
                if (createGameRequest.Password != createGameRequest.ConfirmPassword)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Passwords don't match" });
                }

                if (createGameRequest.GameAttributes.CharacterLimit <= 1 ||
                    createGameRequest.GameAttributes.CharacterLimit > 4000)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Invalid character limit" });
                }

                if (!GameCodeUtils.TryCreateGameCode(_context, out string code))
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { title = "Had difficulty creating a new game token :/ Try again?" });
                }

                var gameFlags = (createGameRequest.GameAttributes.CanSeePrecedingContent ? PaperFolliesGameFlags.CanSeePrecedingContent : PaperFolliesGameFlags.None) |
                    (createGameRequest.GameAttributes.CanSeeFollowingContent ? PaperFolliesGameFlags.CanSeeFollowingContent : PaperFolliesGameFlags.None) |
                    (createGameRequest.GameAttributes.ParticipantsHaveBiographies ? PaperFolliesGameFlags.ParticipantsHaveBiographies : PaperFolliesGameFlags.None) |
                    (createGameRequest.GameAttributes.AddPlayersManually ? PaperFolliesGameFlags.AddPlayersManually : PaperFolliesGameFlags.None) |
                    (createGameRequest.GameAttributes.PlayersAreRandomlyOrdered ? PaperFolliesGameFlags.RandomlyOrderPlayers : PaperFolliesGameFlags.None);

                var game = new PaperFolliesGame
                {
                    Title = createGameRequest.GameAttributes.Title.Trim(),
                    Description = createGameRequest.GameAttributes.Description?.Trim(),
                    Code = code,
                    Flags = gameFlags,
                    CharacterLimit = createGameRequest.GameAttributes.CharacterLimit,
                };

                _context.Add(game);

                var playerFlags = PaperFolliesParticipantFlags.IsAdmin |
                    (createGameRequest.ParticipantAttributes.IsPlayer ? PaperFolliesParticipantFlags.IsPlayer : PaperFolliesParticipantFlags.None) |
                    (createGameRequest.ParticipantAttributes.IsPlayer && (createGameRequest.GameAttributes.PlayersAreRandomlyOrdered || !createGameRequest.GameAttributes.AddPlayersManually) ? PaperFolliesParticipantFlags.IsAdded : PaperFolliesParticipantFlags.None);

                var participant = new PaperFolliesParticipant
                {
                    Name = createGameRequest.ParticipantAttributes.Name.Trim(),
                    Biography = createGameRequest.GameAttributes.ParticipantsHaveBiographies && !string.IsNullOrEmpty(createGameRequest.ParticipantAttributes.Biography?.Trim()) ? createGameRequest.ParticipantAttributes.Biography.Trim() : null,
                    Game = game,
                    Flags = playerFlags,
                    ContentIndex = createGameRequest.ParticipantAttributes.IsPlayer &&
                    !createGameRequest.GameAttributes.AddPlayersManually &&
                    !createGameRequest.GameAttributes.PlayersAreRandomlyOrdered ? 1 : 0
                };

                if (!string.IsNullOrEmpty(createGameRequest.Password))
                {
                    participant.HashedPassword = _passwordHasher.HashPassword(participant, createGameRequest.Password);
                }

                _context.Add(participant);

                await _context.SaveChangesAsync();

                var participantToken = _participantService.GetToken(game.Id.ToString(),
                    GameType.PaperFollies,
                    participant.Id.ToString(),
                    ParticipantType.Admin);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    GameId = game.Id,
                    GameCode = game.Code,
                    ParticipantToken = participantToken,
                    Participant = ToParticipantObject(participant)
                });

            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> PostLogin(LoginRequest loginRequest)
        {
            try
            {
                var participant = await _context.PaperFolliesParticipants.FindAsync(loginRequest.ParticipantId);

                if (participant == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Player not found" });
                }

                var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(participant, participant.HashedPassword, loginRequest.ParticipantPassword);

                if (passwordVerificationResult == PasswordVerificationResult.Failed)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Passwords are bad" });
                }

                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Id == participant.GameId);

                var playerToken = _participantService.GetToken(game.Id.ToString(),
                    GameType.PaperFollies,
                    participant.Id.ToString(),
                    participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdmin) ? ParticipantType.Admin : ParticipantType.Player);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    PlayerToken = playerToken,
                    Game = ToGameObject(game),
                    Participant = ToParticipantObject(participant),
                    Participants = game.Participants.Select(p => ToParticipantAttributesObject(p)),
                    precedingPlayerState = new
                    {
                        Content = participant.PrecedingPlayer?.Content ?? "",
                        ContentVersion = participant.PrecedingPlayer?.ContentVersion ?? 0
                    },
                    FollowingPlayerState = new
                    {
                        Content = participant.FollowingPlayer?.Content ?? "",
                        ContentVersion = participant.FollowingPlayer?.ContentVersion ?? 0
                    },
                    FinalContents = game.Flags.HasFlag(PaperFolliesGameFlags.IsEnded) ?
                    game.Players.OrderBy(a => a.ContentIndex).Select(p => p.Content) :
                    new List<string> { }
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("participants")]
        public async Task<IActionResult> GetParticipants()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "wrong game type" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);

                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    Participants = game.Participants.Select(p => ToParticipantAttributesObject(p))
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [HttpGet("game/state")]
        public async Task<IActionResult> GetGameState()
        {
            try
            {
                var user = HttpContext.User;

                var gameType = user.FindFirst(ClaimType.GameType).Value;

                if (gameType != GameType.PaperFollies)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "wrong game type" });
                }

                var gameId = long.Parse(user.FindFirst(ClaimType.GameId).Value);
                var game = await _context.PaperFolliesGames
                    .Include(g => g.Participants)
                    .FirstOrDefaultAsync(g => g.Id == gameId);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    GameState = ToGameStateObject(game),
                    Participants = game.Participants.Select(p => ToParticipantAttributesObject(p))
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("game/code/{gameCode}")]
        public async Task<IActionResult> GetGameFromCode(string gameCode)
        {
            try
            {
                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Code == gameCode);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game not found" });
                }
                else
                {
                    return StatusCode(StatusCodes.Status200OK, new
                    {
                        Game = ToGameObject(game),
                        Participants = game.Participants.Select(p => ToParticipantAttributesObject(p))
                    });
                }
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("participant")]
        public async Task<IActionResult> PostParticipant(CreateParticipantRequest createplayerRequest)
        {
            try
            {
                if (createplayerRequest.Password != createplayerRequest.ConfirmPassword)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Passwords don't match" });
                }

                var game = await _context.PaperFolliesGames
                    .Include(b => b.Participants)
                    .FirstOrDefaultAsync(g => g.Id == createplayerRequest.GameId);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game doesn't exist" });
                }

                if (game.Flags.HasFlag(PaperFolliesGameFlags.IsStarted))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game already started" });
                }

                if (!string.Equals(game.Code, createplayerRequest.GameCode))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "Game Id and Code don't match" });
                }

                var flags = PaperFolliesParticipantFlags.IsPlayer |
                    (!game.Flags.HasFlag(PaperFolliesGameFlags.AddPlayersManually) ? PaperFolliesParticipantFlags.IsAdded : PaperFolliesParticipantFlags.None);

                var player = new PaperFolliesParticipant
                {
                    Name = createplayerRequest.ParticipantAttributes.Name.Trim(),
                    Biography = game.Flags.HasFlag(PaperFolliesGameFlags.ParticipantsHaveBiographies) && !string.IsNullOrEmpty(createplayerRequest.ParticipantAttributes.Biography.Trim()) ? createplayerRequest.ParticipantAttributes.Biography.Trim() : null,
                    Flags = flags,
                    Game = game,
                    ContentIndex = !game.Flags.HasFlag(PaperFolliesGameFlags.AddPlayersManually) &&
                        !game.Flags.HasFlag(PaperFolliesGameFlags.RandomlyOrderPlayers) ? game.Players.Count() : 0
                };

                if (!string.IsNullOrEmpty(createplayerRequest.Password))
                {
                    player.HashedPassword = _passwordHasher.HashPassword(player, createplayerRequest.Password);
                }

                _context.Add(player);

                await _context.SaveChangesAsync();

                var playerToken = _participantService.GetToken(game.Id.ToString(),
                    GameType.PaperFollies,
                    player.Id.ToString(),
                    ParticipantType.Player);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    PlayerToken = playerToken,
                    ParticipantAttributes = ToParticipantAttributesObject(player)
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        private object ToGameObject(PaperFolliesGame game)
        {
            return new
            {
                Attributes = new
                {
                    game.Id,
                    game.Code,
                    CanSeePrecedingContent = game.Flags.HasFlag(PaperFolliesGameFlags.CanSeePrecedingContent),
                    CanSeeFollowingContent = game.Flags.HasFlag(PaperFolliesGameFlags.CanSeeFollowingContent),
                    game.Title,
                    game.Description,
                    ParticipantsHaveBiographies = game.Flags.HasFlag(PaperFolliesGameFlags.ParticipantsHaveBiographies),
                    AddPlayersManually = game.Flags.HasFlag(PaperFolliesGameFlags.AddPlayersManually),
                    PlayersAreRandomlyOrdered = game.Flags.HasFlag(PaperFolliesGameFlags.RandomlyOrderPlayers),
                    game.CharacterLimit
                },
                State = ToGameStateObject(game)
            };
        }

        private object ToGameStateObject(PaperFolliesGame game)
        {
            return new
            {
                IsStarted = game.Flags.HasFlag(PaperFolliesGameFlags.IsStarted),
                IsEnding = game.Flags.HasFlag(PaperFolliesGameFlags.IsEnding),
                IsEnded = game.Flags.HasFlag(PaperFolliesGameFlags.IsEnded),
                IsShared = game.Flags.HasFlag(PaperFolliesGameFlags.IsShared)
            };
        }

        private object ToParticipantObject(PaperFolliesParticipant participant)
        {
            return new
            {
                Attributes = ToParticipantAttributesObject(participant),
                State = new
                {
                    Content = participant.Content ?? "",
                    participant.ContentVersion,
                    IsEnded = participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsEnded)
                }
            };
        }

        private object ToParticipantAttributesObject(PaperFolliesParticipant participant)
        {
            return new
            {
                participant.Id,
                participant.ContentIndex,
                participant.Name,
                participant.Biography,
                IsAdmin = participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdmin),
                IsPlayer = participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsPlayer),
                IsAdded = participant.Flags.HasFlag(PaperFolliesParticipantFlags.IsAdded)
            };
        }

        private object ToPlayerSummaryObject(PaperFolliesParticipant player)
        {
            return new
            {
                player.Name,
                player.ContentIndex,
                player.ContentVersion,
                IsEnded = player.Flags.HasFlag(PaperFolliesParticipantFlags.IsEnded)
            };
        }
    }
}
