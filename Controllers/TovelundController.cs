using Lotographia.Data;
using Lotographia.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Lotographia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TovelundController : ControllerBase
    {
        private readonly LotographiaContext _context;

        public TovelundController(LotographiaContext context)
        {
            _context = context;
        }

        // POST api/<LexicologerController>
        [HttpPost]
        public async Task<IActionResult> Post(CreateTovelundGameRequest request)
        {
            try
            {
                var game = new TovelundGame
                {
                    Title = request.Title,
                    Design = request.Design
                };

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

        // POST api/<LexicologerController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(long id, CreateTovelundGameRequest request)
        {
            try
            {
                var game = await _context.TovelundGames.FindAsync(id);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "game not found" });
                }

                game.Design = request.Design;
                game.Title = request.Title;

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        // GET api/<LexicologerController>
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return StatusCode(StatusCodes.Status200OK, new
                {
                    Games = _context.TovelundGames.Select(g => new { g.Id, g.Title })
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        // GET api/<LexicologerController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            try
            {
                var game = await _context.TovelundGames.FindAsync(id);

                if (game == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "game not found" });
                }

                return StatusCode(StatusCodes.Status200OK, game.Design);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }
    }

    public class CreateTovelundGameRequest
    {
        public string Title { get; set; }
        public string Design { get; set; }
    }
}
