using Domain;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/hints")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class HintsController(TimeProvider clock) : ControllerBase
{
    [HttpGet("today/{day:int}")]
    public ActionResult<DecorationHint> Today(int day) => Resolve(day, DecemberCalendar.Today(clock));

    [HttpGet("/api/dev/window-preview/hint/{day:int}")]
    public ActionResult<DecorationHint> Preview(int day, [FromQuery] DateOnly previewDate,
        [FromServices] IWebHostEnvironment environment)
    {
        if (!environment.IsDevelopment()) return NotFound();
        if (!DecemberCalendar.IsPreviewDate(previewDate)) return BadRequest();
        return Resolve(day, previewDate);
    }

    private ActionResult<DecorationHint> Resolve(int day, DateOnly date)
    {
        if (day != DecemberCalendar.DecorationIndex(date)) return NotFound();
        var message = DecemberHints.ForDecoration(day);
        return message is null ? NotFound() : new DecorationHint(message);
    }

    public sealed record DecorationHint(string Message);
}
