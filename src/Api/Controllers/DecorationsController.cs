using Domain;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/decorations")]
public sealed class DecorationsController(TimeProvider clock, DecorationCatalog catalog) : ControllerBase
{
    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Scene Today() => SceneFor(DecemberCalendar.Today(clock));

    [HttpGet("/api/dev/window-preview/decorations")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public ActionResult<Scene> Preview([FromQuery] DateOnly previewDate, [FromServices] IWebHostEnvironment environment)
    {
        if (!environment.IsDevelopment()) return NotFound();
        if (!DecemberCalendar.IsPreviewDate(previewDate)) return BadRequest();
        return SceneFor(previewDate);
    }

    [HttpGet("art/{key}/{version}")]
    public IActionResult Image(string key, string version)
    {
        var path = catalog.ImagePath(key, version, DecemberCalendar.DecorationIndex(DecemberCalendar.Today(clock)));
        if (path is null) return Unavailable();
        Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        return PhysicalFile(path, "image/webp");
    }

    [HttpGet("/api/dev/window-preview/decoration-art/{key}/{version}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult PreviewImage(string key, string version, [FromQuery] DateOnly previewDate,
        [FromServices] IWebHostEnvironment environment)
    {
        if (!environment.IsDevelopment()) return NotFound();
        if (!DecemberCalendar.IsPreviewDate(previewDate)) return BadRequest();
        var path = catalog.ImagePath(key, version, DecemberCalendar.DecorationIndex(previewDate));
        return path is null ? NotFound() : PhysicalFile(path, "image/webp");
    }

    private Scene SceneFor(DateOnly date)
    {
        var day = Math.Min(DecemberCalendar.DecorationIndex(date), 32);
        return new Scene(day, catalog.Visible(day));
    }

    private IActionResult Unavailable()
    {
        Response.Headers.CacheControl = "no-store";
        return NotFound();
    }

    public sealed record Scene(int Day, IReadOnlyList<DecorationCatalog.Layer> Layers);
}
