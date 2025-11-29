namespace Api.Contracts.Responses;

public enum ErrorCode
{
    InvalidSearchDate = 0,
    InvalidUserTimeZone = 1,
    SearchDatePassed = 2,
    SearchDateHasNotAppeared = 3,
    ResourceIsNotConfigured = 4,
}
