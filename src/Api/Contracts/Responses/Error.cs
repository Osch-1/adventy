using System.Text.Json.Serialization;

namespace Api.Contracts.Responses;

public class Error( ErrorType type, ErrorCode code, string message )
{

    [JsonPropertyName( "type" )]
    public ErrorType Type { get; init; } = type;

    [JsonPropertyName( "code" )]
    public ErrorCode Code { get; init; } = code;

    [JsonPropertyName( "message" )]
    public string Message { get; init; } = message;
}
