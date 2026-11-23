using Api.Controllers;
using Api.Contracts.Responses;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Xunit;
using ApiAdventure = Api.Contracts.Adventures.Adventure;

namespace Adventy.Tests;

public class AdventuresTests
{
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
    public void ReleasedDatesReturnTheCorrectAdventureForEveryDay(int day)
    {
        var date = new DateTime(2026, 12, day);
        var result = CreateController(new DateTimeOffset(2026, 12, 31, 12, 0, 0, TimeSpan.Zero)).GetAdventure(date);

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
        var result = CreateController().GetAdventure(new DateTime(year, month, day));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<Response>(badRequest.Value);
        Assert.NotNull(response.Errors);
        Assert.Equal(ErrorCode.InvalidSearchDate, Assert.Single(response.Errors).Code);
    }

    [Theory]
    [MemberData(nameof(DecemberDays))]
    public void UnreleasedAdventuresAreHidden(int day)
    {
        // The controller sees November 30, 2026 regardless of the real date.
        var controller = CreateController();
        var date = new DateTime(2026, 12, day);

        AssertAdventureIsHidden(controller.GetAdventure(date));
    }

    [Theory]
    [MemberData(nameof(DecemberDays))]
    public void AdventureOpensExactlyAtMidnightInMoscow(int day)
    {
        var date = new DateTime(2026, 12, day);
        var midnightUtc = new DateTimeOffset(2026, 12, day, 0, 0, 0, TimeSpan.FromHours(3)).ToUniversalTime();
        var beforeMidnight = CreateController(midnightUtc.AddTicks(-1));
        var atMidnight = CreateController(midnightUtc);

        AssertAdventureIsHidden(beforeMidnight.GetAdventure(date));
        Assert.IsType<OkObjectResult>(atMidnight.GetAdventure(date));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(15)]
    [InlineData(31)]
    public void PastAdventuresRemainAvailableAfterTheSeason(int day)
    {
        var controller = CreateController(new DateTimeOffset(2030, 1, 1, 0, 0, 0, TimeSpan.Zero));
        var result = controller.GetAdventure(new DateTime(2026, 12, day));

        Assert.IsType<OkObjectResult>(result);
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

    private static AdventuresController CreateController(DateTimeOffset? utcNow = null) =>
        new(new FixedTimeProvider(utcNow ?? new DateTimeOffset(2026, 11, 30, 12, 0, 0, TimeSpan.Zero)));

    [Fact]
    public void SimulatedDatesControlAllTasksRegardlessOfRealServerTime()
    {
        foreach (var now in new[] {
            new DateTimeOffset(2026, 11, 5, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2030, 1, 1, 0, 0, 0, TimeSpan.Zero) })
        {
            var controller = CreateController(now);
            for (var date = new DateOnly(2026, 11, 29); date <= new DateOnly(2027, 1, 1); date = date.AddDays(1))
            for (var day = 1; day <= 31; day++)
            {
                var result = controller.GetPreviewAdventure(new DateTime(2026, 12, day), date,
                    new PreviewEnvironment("Development"));
                if (new DateOnly(2026, 12, day) > date) AssertAdventureIsHidden(result);
                else
                {
                    var response = Assert.IsType<Response<ApiAdventure>>(Assert.IsType<OkObjectResult>(result).Value);
                    var expected = new DailyAdventureProvider().GetAdventureForDate(
                        new DateTimeOffset(2026, 12, day, 0, 0, 0, TimeSpan.Zero));
                    Assert.Equal(expected!.Message, response.Data!.Message);
                }
            }
        }
    }

    [Theory]
    [InlineData("Production")]
    [InlineData("Staging")]
    public void SimulationIsUnavailableOutsideDevelopment(string environment)
    {
        Assert.IsType<NotFoundResult>(CreateController().GetPreviewAdventure(new DateTime(2026, 12, 1),
            new DateOnly(2026, 12, 1), new PreviewEnvironment(environment)));
    }

    [Theory]
    [InlineData("2026-11-28")]
    [InlineData("2027-01-02")]
    public void SimulationRejectsDatesOutsideTheSelector(string date)
    {
        Assert.IsType<BadRequestObjectResult>(CreateController().GetPreviewAdventure(new DateTime(2026, 12, 1),
            DateOnly.Parse(date), new PreviewEnvironment("Development")));
    }

    [Fact]
    public void SimulationStillChecksTaskRange()
    {
        var controller = CreateController();
        var environment = new PreviewEnvironment("Development");
        Assert.IsType<BadRequestObjectResult>(controller.GetPreviewAdventure(new DateTime(2027, 1, 1),
            new DateOnly(2027, 1, 1), environment));
    }
    [Fact]
    public void TodayHintChangesAtMoscowMidnightAndDoesNotExposeOtherDays()
    {
        var midnight = new DateTimeOffset(2026, 11, 30, 21, 0, 0, TimeSpan.Zero);
        var before = new HintsController(new FixedTimeProvider(midnight.AddTicks(-1)));
        var after = new HintsController(new FixedTimeProvider(midnight));

        Assert.StartsWith("Хрустящий конверт", before.Today(0).Value!.Message);
        Assert.IsType<NotFoundResult>(before.Today(1).Result);
        Assert.IsType<NotFoundResult>(after.Today(0).Result);
        Assert.StartsWith("Три взгляда", after.Today(1).Value!.Message);
        Assert.IsType<NotFoundResult>(after.Today(31).Result);
    }

    [Theory]
    [InlineData("2026-11-29T20:59:59Z", -1)]
    [InlineData("2026-11-29T21:00:00Z", 0)]
    [InlineData("2026-12-30T20:59:59Z", 30)]
    [InlineData("2026-12-30T21:00:00Z", 31)]
    [InlineData("2026-12-31T21:00:00Z", 32)]
    public void OnlyTheScheduledDecorationHasContent(string utc, int today)
    {
        var controller = new HintsController(new FixedTimeProvider(DateTimeOffset.Parse(utc)));
        for (var day = -1; day <= 32; day++)
        {
            var result = controller.Today(day);
            if (day == today && day >= 0 && day <= 31)
                Assert.False(string.IsNullOrWhiteSpace(result.Value!.Message));
            else
                Assert.IsType<NotFoundResult>(result.Result);
        }
    }

    [Fact]
    public void HintPreviewRespectsTheSimulatedDayAndIsUnavailableInProduction()
    {
        var controller = new HintsController(new FixedTimeProvider(DateTimeOffset.UnixEpoch));
        var day = new DateOnly(2026, 12, 31);
        var development = new PreviewEnvironment("Development");

        Assert.IsType<NotFoundResult>(controller.Preview(31, day, new PreviewEnvironment("Production")).Result);
        Assert.IsType<NotFoundResult>(controller.Preview(30, day, development).Result);
        Assert.IsType<BadRequestResult>(controller.Preview(32, day.AddDays(2), development).Result);
        Assert.StartsWith("Спасибо, что открывали окна", controller.Preview(31, day, development).Value!.Message);
    }

    [Fact]
    public void DecorationCatalogDoesNotServeFutureMetadataOrImages()
    {
        var catalog = new Api.DecorationCatalog(Path.Combine(AppContext.BaseDirectory, "DecorationAssets"));
        var complete = catalog.Visible(32);
        Assert.Equal(34, complete.Count);
        foreach (var day in Enumerable.Range(-1, 34))
        {
            var scene = catalog.Visible(day);
            Assert.Equal(complete.Where(layer => layer.Day <= day).Select(layer => layer.Key),
                scene.Select(layer => layer.Key));
            foreach (var layer in complete)
            {
                var path = catalog.ImagePath(layer.Key, layer.Version, day);
                if (layer.Day <= day)
                    Assert.True(File.Exists(path));
                else
                    Assert.Null(path);
            }
        }
        Assert.Null(catalog.ImagePath("../manifest.json", "", 32));
    }

    [Fact]
    public void SceneChangesAtMoscowMidnightAndProductionCannotSimulate()
    {
        var catalog = new Api.DecorationCatalog(Path.Combine(AppContext.BaseDirectory, "DecorationAssets"));
        var midnight = new DateTimeOffset(2026, 11, 30, 21, 0, 0, TimeSpan.Zero);
        var before = new DecorationsController(new FixedTimeProvider(midnight.AddTicks(-1)), catalog);
        var after = new DecorationsController(new FixedTimeProvider(midnight), catalog);
        var previewDate = new DateOnly(2026, 12, 31);
        var finale = catalog.Visible(31).Single(layer => layer.Day == 31);
        var production = new PreviewEnvironment("Production");

        Assert.Equal(0, before.Today().Day);
        Assert.Equal(1, after.Today().Day);
        Assert.DoesNotContain(before.Today().Layers, layer => layer.Day == 1);
        Assert.Contains(after.Today().Layers, layer => layer.Day == 1);
        Assert.IsType<NotFoundResult>(after.Preview(previewDate, production).Result);
        Assert.IsType<NotFoundResult>(after.PreviewImage(finale.Key, finale.Version, previewDate, production));
    }

    private sealed class PreviewEnvironment(string name) : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = name;
        public string ApplicationName { get; set; } = "Adventy.Tests";
        public string ContentRootPath { get; set; } = "";
        public string WebRootPath { get; set; } = "";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }

    private static void AssertAdventureIsHidden(IActionResult result)
    {
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<Response>(badRequest.Value);
        Assert.NotNull(response.Errors);
        Assert.Equal(ErrorCode.SearchDateHasNotAppeared, Assert.Single(response.Errors).Code);
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
