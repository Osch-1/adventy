namespace Domain;

public static class DecemberCalendar
{
    private static readonly TimeZoneInfo Moscow = TimeZoneInfo.FindSystemTimeZoneById("Europe/Moscow");
    public static readonly DateOnly FirstDecoration = new(2026, 11, 30);
    private static readonly DateOnly LastDecoration = new(2026, 12, 31);

    public static DateOnly Today(TimeProvider clock) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(clock.GetUtcNow(), Moscow).DateTime);

    public static bool IsPreviewDate(DateOnly date) =>
        date >= FirstDecoration.AddDays(-1) && date <= LastDecoration.AddDays(1);

    public static int DecorationIndex(DateOnly date) => date.DayNumber - FirstDecoration.DayNumber;
}
