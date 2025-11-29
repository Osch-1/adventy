using System.Net;
using Api.Contracts.Adventure;
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
    private const string _skipSearchDatePassedValidationSecret = "AYgAQYogQyCggDEAAYogQYiQUyC_secret_to_skip_date_passed";

    private static readonly DateTimeOffset _leftSearchBoarder = new( 2025, 12, 10, 0, 0, 0, TimeSpan.Zero );
    private static readonly DateTimeOffset _rightSearchBoarder = new( 2026, 1, 1, 0, 0, 0, TimeSpan.Zero );

    private readonly DailyMessageProvider _dailyMessageProvider;

    public AdventuresController()
    {
        _dailyMessageProvider = new DailyMessageProvider();
    }

    [HttpGet( "" )]
    [ProducesResponseType( typeof( Response<Adventure> ), ( int )HttpStatusCode.OK )]
    public IActionResult GetAdventure(
        [FromQuery] DateTime searchDateTime,
        [FromHeader( Name = "X-Timezone" )] string? userTimezoneId,
        [FromHeader( Name = "Adventy-SkipSearchDateInRangeValidationSecret" )] string? skipSearchDateInRangeValidationSecret,
        [FromHeader( Name = "Adventy-SkipSearchDateHasNotAppearedValidationSecret" )] string? skipSearchDateHasNotAppearedValidationSecret,
        [FromHeader( Name = "Adventy-SkipSearchDatePassedValidationSecret" )] string? skipSearchDatePassedValidationSecret )
    {
        DateTimeOffset searchDateTimeOffset = new( searchDateTime, TimeSpan.Zero );

        bool skipSearchDateInRangeValidation = _skipSearchDateInRangeValidationSecret.Equals( skipSearchDateInRangeValidationSecret, StringComparison.InvariantCulture );
        bool skipSearchDateHasNotAppearedValidation = _skipSearchDateHasNotAppearedValidationSecret.Equals( skipSearchDateHasNotAppearedValidationSecret, StringComparison.InvariantCulture );
        bool skipSearchDatePassedValidation = _skipSearchDatePassedValidationSecret.Equals( skipSearchDatePassedValidationSecret, StringComparison.InvariantCulture );

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

        DateTimeOffset serverUtcNowDate = DateTimeOffset.UtcNow.Date;
        DateTimeOffset userLocalDate = TimeZoneInfo.ConvertTime( serverUtcNowDate, userTimeZone );
        if ( !skipSearchDatePassedValidation && ( userLocalDate > searchDateTimeOffset ) )
        {
            const string msgTemplate = "Requested date {0} already passed and are not currently accessible.";
            string msg = string.Format( msgTemplate, searchDateTime.ToString( "yyyy-MM-dd" ) );
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.SearchDatePassed, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        if ( !skipSearchDateHasNotAppearedValidation && ( userLocalDate < searchDateTimeOffset ) )
        {
            const string msgTemplate = "Requested date {0} is not yet appeared, please wait a little bit.";
            string msg = string.Format( msgTemplate, searchDateTime.ToString( "yyyy-MM-dd" ) );
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.SearchDateHasNotAppeared, msg );
            Response response = new( error );

            return BadRequest( response );
        }

        string? dailyMessage = _dailyMessageProvider.GetMessageForDate( searchDateTimeOffset );
        if ( string.IsNullOrWhiteSpace( dailyMessage ) )
        {
            const string msgTemplate = "Requested date {0} does not have mapped task, please contact hr.";
            string msg = string.Format( msgTemplate, searchDateTime.ToString( "yyyy-MM-dd" ) );
            Error error = new( ErrorType.InvalidRequestParameters, ErrorCode.SearchDateHasNotAppeared, msg );
            Response response = new( error );

            return StatusCode( ( int )HttpStatusCode.InternalServerError, response );
        }

        Adventure adventure = new( dailyMessage );
        Response<Adventure> dailyMessageResponse = new( adventure );

        return Ok( dailyMessageResponse );
    }
}
