using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/clock")]
public class ClockController(TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public DateTimeOffset Get() => timeProvider.GetUtcNow();
}
