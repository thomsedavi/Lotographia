using Lotographia.Data;
using Lotographia.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lotographia.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LexicologerController : ControllerBase
    {
        private readonly LotographiaContext _context;

        public LexicologerController(LotographiaContext context)
        {
            _context = context;
        }

        // GET api/<LexicologerController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            try {
                var game = await _context.LexicologerGames.FindAsync(id);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "game not found" });
                }

                return StatusCode(StatusCodes.Status200OK, game);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        // POST api/<LexicologerController>
        [HttpPost]
        public async Task<IActionResult> Post(CreateLexicologerGameRequest request)
        {
            try
            {
                var game = new LexicologerGame {
                    CharacterLimit = request.CharacterLimit,
                    Words = request.Words                    
                };

                if (!string.IsNullOrWhiteSpace(request.Title))
                {
                    game.Title = request.Title;
                }

                if (!string.IsNullOrWhiteSpace(request.Details))
                {
                    game.Details = request.Details;
                }

                _context.Add(game);

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new
                {
                    GameId = game.Id
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }
    }

    public class CreateLexicologerGameRequest
    {
        public string Title { get; set; }
        public string Details { get; set; }
        public int CharacterLimit { get; set; }
        public List<LexicologerWord> Words { get; set; }
    }
}
