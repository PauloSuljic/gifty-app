namespace Gifty.Application.Common.Exceptions;

public class BadRequestException : Exception
{
    public IDictionary<string, string[]>? Errors { get; }

    public BadRequestException()
        : base("One or more validation errors occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public BadRequestException(string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public BadRequestException(string message, Exception innerException)
        : base(message, innerException)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public BadRequestException(IDictionary<string, string[]> errors)
        : this()
    {
        Errors = errors;
    }
}