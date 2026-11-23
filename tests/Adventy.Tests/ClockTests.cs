using Api.Controllers;
using Xunit;

namespace Adventy.Tests;

public class ClockTests
{
    [Fact]
    public void ClockUsesTheInjectedServerTime()
    {
        var expected = new DateTimeOffset(2026, 11, 30, 21, 0, 0, TimeSpan.Zero);
        Assert.Equal(expected, new ClockController(new FixedClock(expected)).Get());
    }

    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
