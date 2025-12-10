using System.Net;
using Api.Contracts.Responses;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route( "/api/[controller]/" )]
public class AdventuresController : ControllerBase
{
    private const string _skipSearchDateInRangeValidationSecret = "CggAEEUYFhgeGDkyCggBEAAYgA_secret_to_skip_date_in_range";
    private const string _skipSearchDateHasNotAppearedValidationSecret = "EgZjaHJvbWUyCggAE_secret_to_skip_date_has_not_appeared";

    private static readonly DateTimeOffset _leftSearchBoarder = new( 2025, 12, 10, 0, 0, 0, TimeSpan.Zero );
    private static readonly DateTimeOffset _rightSearchBoarder = new( 2026, 1, 1, 0, 0, 0, TimeSpan.Zero );

    private readonly DailyAdventureProvider _dailyAdventureProvider;

    public AdventuresController()
    {
        _dailyAdventureProvider = new DailyAdventureProvider();
    }

    [HttpGet( "" )]
    [ProducesResponseType( typeof( Response<Adventure> ), ( int )HttpStatusCode.OK )]
    public IActionResult GetAdventure(
        [FromQuery] DateTime searchDateTime,
        [FromHeader( Name = "X-Timezone" )] string? userTimezoneId,
        [FromHeader( Name = "Adventy-SkipSearchDateInRangeValidationSecret" )] string? skipSearchDateInRangeValidationSecret,
        [FromHeader( Name = "Adventy-SkipSearchDateHasNotAppearedValidationSecret" )] string? skipSearchDateHasNotAppearedValidationSecret )
    {
        DateTimeOffset searchDateTimeOffset = new( searchDateTime, TimeSpan.Zero );

        bool skipSearchDateInRangeValidation = _skipSearchDateInRangeValidationSecret.Equals( skipSearchDateInRangeValidationSecret, StringComparison.InvariantCulture );
        bool skipSearchDateHasNotAppearedValidation = _skipSearchDateHasNotAppearedValidationSecret.Equals( skipSearchDateHasNotAppearedValidationSecret, StringComparison.InvariantCulture );

        if ( !skipSearchDateInRangeValidation && ( searchDateTimeOffset < _leftSearchBoarder || searchDateTimeOffset >= _rightSearchBoarder ) )
        {
            const string msg = "Search date must be in range from 10th of December 2025 up to 31st of December 2025.";
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.InvalidSearchDate, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        if ( string.IsNullOrWhiteSpace( userTimezoneId ) )
        {
            const string msg = "No user time zone has been provided. User time zone must be provided in format of IANA Id.";
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.InvalidUserTimeZone, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        TimeZoneInfo userTimeZone;
        try
        {
            userTimeZone = TimeZoneInfo.FindSystemTimeZoneById( userTimezoneId );
        }
        catch ( TimeZoneNotFoundException )
        {
            const string msg = "User time zone must be provided in format of IANA Id.";
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.InvalidUserTimeZone, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        DateTimeOffset serverUtcNow = DateTimeOffset.UtcNow;
        DateTimeOffset userLocalNow = TimeZoneInfo.ConvertTime( serverUtcNow, userTimeZone );
        DateTimeOffset userLocalDate = userLocalNow.Date;
        DateTimeOffset searchDateInUserTimezone = TimeZoneInfo.ConvertTime( searchDateTimeOffset, userTimeZone ).Date;
        if ( !skipSearchDateHasNotAppearedValidation && ( userLocalDate < searchDateInUserTimezone ) )
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
