namespace Domain;

public class Adventure
{
    public DateTimeOffset Date { get; }
    public string Title { get; }
    public string Message { get; }

    public Adventure( DateTimeOffset date, string title, string message )
    {
        Date = date;
        Title = title;
        Message = message;
    }
}

