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
    public class TovelundPuzzlesController : ControllerBase
    {
        private readonly LotographiaContext _context;

        public TovelundPuzzlesController(LotographiaContext context)
        {
            _context = context;
        }

        // POST api/<LexicologerController>
        [HttpPost]
        public async Task<IActionResult> Post(CreateTovelundPuzzleRequest request)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development")
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = "Oh no it broke for some reason" });
            }

            try
            {
                var puzzle = new TovelundPuzzle
                {
                    Title = request.Title,
                    Design = request.Design,
                    Difficulty = request.Difficulty
                };

                _context.Add(puzzle);

                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new
                {
                    PuzzleId = puzzle.Id
                });
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }

        // POST api/<LexicologerController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(long id, CreateTovelundPuzzleRequest request)
        {
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development")
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = "Oh no it broke for some reason" });
            }

            try
            {
                var puzzle = await _context.TovelundPuzzles.FindAsync(id);

                if (puzzle == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "puzzle not found" });
                }

                puzzle.Design = request.Design;
                puzzle.Title = request.Title;
                puzzle.Difficulty = request.Difficulty;

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
                    Puzzles = _context.TovelundPuzzles.Select(g => new { g.Id, g.Title, g.Design, g.Difficulty })
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
                var puzzle = await _context.TovelundPuzzles.FindAsync(id);

                if (puzzle == null)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { title = "puzzle not found" });
                }

                return StatusCode(StatusCodes.Status200OK, puzzle.Design);
            }
            catch (Exception exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { title = exception.Message });
            }
        }
    }

    public class CreateTovelundPuzzleRequest
    {
        public string Title { get; set; }
        public string Design { get; set; }
        public byte Difficulty { get; set; }
    }
}
