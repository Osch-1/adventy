using System.Net;
using Api.Contracts.Responses;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route( "/api/[controller]/" )]
public class AdventuresController : ControllerBase
{

    private static readonly DateTimeOffset _leftSearchBoundary = new( 2026, 12, 1, 0, 0, 0, TimeSpan.Zero );
    private static readonly DateTimeOffset _rightSearchBoundary = new( 2027, 1, 1, 0, 0, 0, TimeSpan.Zero );

    private readonly DailyAdventureProvider _dailyAdventureProvider;
    private readonly TimeProvider _timeProvider;

    public AdventuresController( TimeProvider timeProvider )
    {
        _dailyAdventureProvider = new DailyAdventureProvider();
        _timeProvider = timeProvider;
    }

    [HttpGet( "" )]
    [ProducesResponseType( typeof( Response<Adventure> ), ( int )HttpStatusCode.OK )]
    public IActionResult GetAdventure(
        [FromQuery] DateTime searchDateTime ) => ResolveAdventure( searchDateTime );

    // Simulated dates are accepted only by the development endpoint.
    [HttpGet( "/api/dev/window-preview/adventure" )]
    [ResponseCache( NoStore = true, Location = ResponseCacheLocation.None )]
    public IActionResult GetPreviewAdventure(
        [FromQuery] DateTime searchDateTime,
        [FromQuery] DateOnly previewDate,
        [FromServices] IWebHostEnvironment environment )
    {
        if ( !environment.IsDevelopment() ) return NotFound();
        if ( !DecemberCalendar.IsPreviewDate( previewDate ) )
            return BadRequest( new Response( new Error( ErrorType.InvalidRequestParameters,
                ErrorCode.InvalidSearchDate, "Preview date must be between 2026-11-29 and 2027-01-01." ) ) );

        return ResolveAdventure( searchDateTime, previewDate );
    }

    private IActionResult ResolveAdventure( DateTime searchDateTime, DateOnly? simulatedDate = null )
    {
        DateTimeOffset searchDateTimeOffset = new( DateTime.SpecifyKind( searchDateTime, DateTimeKind.Unspecified ), TimeSpan.Zero );


        if ( searchDateTimeOffset < _leftSearchBoundary || searchDateTimeOffset >= _rightSearchBoundary )
        {
            const string msg = "Search date must be in range from 1st of December 2026 up to 31st of December 2026.";
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.InvalidSearchDate, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        DateOnly today = simulatedDate ?? DecemberCalendar.Today( _timeProvider );
        DateOnly searchDate = DateOnly.FromDateTime( searchDateTime );
        if ( today < searchDate )
        {
            const string msgTemplate = "Requested date {0} is not yet appeared, please wait a little bit.";
            string msg = string.Format( msgTemplate, searchDateTime.ToString( "yyyy-MM-dd" ) );
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.SearchDateHasNotAppeared, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        Adventure? domainAdventure = _dailyAdventureProvider.GetAdventureForDate( searchDateTimeOffset );
        if ( domainAdventure is null )
        {
            const string msgTemplate = "Requested date {0} does not have mapped task, please contact hr.";
            string msg = string.Format( msgTemplate, searchDateTime.ToString( "yyyy-MM-dd" ) );
            Error error = new( ErrorType.InternalServerError, ErrorCode.ResourceIsNotConfigured, msg );
            Response response = new( error );

            return StatusCode( ( int )HttpStatusCode.InternalServerError, response );
        }

        Contracts.Adventures.Adventure adventure = new( domainAdventure.Message, domainAdventure.Title );
        Response<Contracts.Adventures.Adventure> dailyMessageResponse = new( adventure );

        return Ok( dailyMessageResponse );
    }
}
