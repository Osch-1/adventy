using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api;

public sealed class DecorationCatalog
{
    private readonly Layer[][] _scenes;
    private readonly Dictionary<string, Layer> _layers;
    private readonly string _directory;

    public DecorationCatalog(string directory)
    {
        _directory = directory;
        var layers = JsonSerializer.Deserialize<Layer[]>(
            File.ReadAllText(Path.Combine(directory, "manifest.json")), JsonSerializerOptions.Web)
            ?? throw new InvalidDataException("Missing decoration manifest");

        _layers = layers.ToDictionary(layer => layer.Key, StringComparer.Ordinal);
        _scenes = Enumerable.Range(0, 32)
            .Select(day => layers.Where(layer => layer.Day <= day).ToArray())
            .ToArray();
    }

    public IReadOnlyList<Layer> Visible(int day) => day < 0 ? [] : _scenes[Math.Min(day, 31)];

    public string? ImagePath(string key, string version, int day) =>
        _layers.TryGetValue(key, out var layer) && layer.Version == version && layer.Day <= day
            ? Path.Combine(_directory, $"decor-{layer.Key}.webp")
            : null;

    public sealed record Layer(string Key, int Day, string Version, double[] Region, double[] Crop,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] double[]? Hit,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Clip,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Mask,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] bool Alpha,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] bool Front,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Frame,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Name,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Surface);
}
