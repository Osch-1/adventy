using Api.Controllers;
using Api.Contracts.Responses;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using ApiAdventure = Api.Contracts.Adventures.Adventure;

namespace Adventy.Tests;

public class AdventuresTests
{
    private const string FutureDatePreviewSecret = "EgZjaHJvbWUyCggAE_secret_to_skip_date_has_not_appeared";

    public static IEnumerable<object[]> DecemberDays =>
        Enumerable.Range(1, 31).Select(day => new object[] { day });

    [Theory]
    [MemberData(nameof(DecemberDays))]
    public void EveryDecemberDayHasAnAdventure(int day)
    {
        var date = new DateTimeOffset(2026, 12, day, 0, 0, 0, TimeSpan.Zero);
        var adventure = new DailyAdventureProvider().GetAdventureForDate(date);

        Assert.NotNull(adventure);
        Assert.Equal(date, adventure.Date);
        Assert.False(string.IsNullOrWhiteSpace(adventure.Title));
        Assert.False(string.IsNullOrWhiteSpace(adventure.Message));
    }

    [Theory]
    [MemberData(nameof(DecemberDays))]
    public void PreviewReturnsTheCorrectAdventureForEveryDay(int day)
    {
        var date = new DateTime(2026, 12, day);
        var result = new AdventuresController().GetAdventure(date, "Europe/Moscow", null, FutureDatePreviewSecret);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<Response<ApiAdventure>>(ok.Value);
        var expected = new DailyAdventureProvider().GetAdventureForDate(new DateTimeOffset(date, TimeSpan.Zero));
        Assert.NotNull(response.Data);
        Assert.Equal(expected!.Title, response.Data.Title);
        Assert.Equal(expected.Message, response.Data.Message);
    }

    [Theory]
    [InlineData(2026, 11, 30)]
    [InlineData(2027, 1, 1)]
    [InlineData(2025, 12, 10)]
    public void DatesOutsideTheCalendarAreRejected(int year, int month, int day)
    {
        var result = new AdventuresController().GetAdventure(new DateTime(year, month, day), "Europe/Moscow", null, FutureDatePreviewSecret);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<Response>(badRequest.Value);
        Assert.NotNull(response.Errors);
        Assert.Equal(ErrorCode.InvalidSearchDate, Assert.Single(response.Errors).Code);
    }

    [Fact]
    public void UnreleasedAdventuresAreHiddenWithoutThePreviewSecret()
    {
        // Once the season is over, there are no future dates in this fixed calendar.
        var today = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow,
            TimeZoneInfo.FindSystemTimeZoneById("Europe/Moscow")).Date;
        var futureDates = Enumerable.Range(1, 31)
            .Select(day => new DateTime(2026, 12, day))
            .Where(date => date > today);

        foreach (var date in futureDates)
        {
            var controller = new AdventuresController();
            foreach (var secret in new string?[] { null, "incorrect-secret" })
            {
                var result = controller.GetAdventure(date, "Europe/Moscow", null, secret);
                var badRequest = Assert.IsType<BadRequestObjectResult>(result);
                var response = Assert.IsType<Response>(badRequest.Value);
                Assert.NotNull(response.Errors);
                Assert.Equal(ErrorCode.SearchDateHasNotAppeared, Assert.Single(response.Errors).Code);
            }
        }
    }

    [Fact]
    public void OrigamiAdventureContainsTheInstructionLink()
    {
        var adventure = new DailyAdventureProvider().GetAdventureForDate(
            new DateTimeOffset(2026, 12, 6, 0, 0, 0, TimeSpan.Zero));

        Assert.Contains("[тут](https://www.youtube.com/watch?v=3v8qVDh1qf4)", adventure!.Message);
    }

    [Theory]
    [InlineData(11, 30)]
    [InlineData(1, 1)]
    public void DatesWithoutAnAdventureReturnNull(int month, int day)
    {
        var date = new DateTimeOffset(2026, month, day, 0, 0, 0, TimeSpan.Zero);
        Assert.Null(new DailyAdventureProvider().GetAdventureForDate(date));
    }
}
