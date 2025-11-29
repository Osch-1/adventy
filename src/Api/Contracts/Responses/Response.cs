using System.Text.Json.Serialization;

namespace Api.Contracts.Responses;

[Serializable]
public class Response : BaseResponse
{
    public Response()
    {
    }

    public Response( Error error )
        : base( error )
    {
    }

    public Response( IEnumerable<Error> errors )
        : base( errors )
    {
    }
}

[Serializable]
public class Response<TData> : BaseResponse
{
    [JsonPropertyName( "data" )]
    public TData? Data { get; init; }

    public Response( TData data )
    {
        Data = data;
    }
    public Response( Error error )
        : base( error )
    {
    }

    public Response( IEnumerable<Error> errors )
        : base( errors )
    {
    }
}
