using System.Text.Json.Serialization;

namespace Api.Contracts.Adventures;

[Serializable]
public class Adventure( string message, string title )
{
    [JsonPropertyName( "message" )]
    public string Message { get; } = message;

    [JsonPropertyName( "title" )]
    public string Title { get; } = title;
}
