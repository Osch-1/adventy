using System.Text.Json.Serialization;

namespace Api.Contracts.Responses;

[Serializable]
public abstract class BaseResponse
{
    [JsonPropertyName( "errors" )]
    public List<Error>? Errors { get; init; }

    public BaseResponse()
    {
    }

    public BaseResponse( Error error )
    {
        Errors = [ error ];
    }

    public BaseResponse( IEnumerable<Error> errors )
    {
        Errors = errors?.Where( x => x != null ).ToList() ?? [];
    }
}
