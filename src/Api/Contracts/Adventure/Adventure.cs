using System.Text.Json.Serialization;

namespace Api.Contracts.Adventure;

[Serializable]
public class Adventure( string message )
{
    [JsonPropertyName( "message" )]
    public string Message { get; } = message;
}
