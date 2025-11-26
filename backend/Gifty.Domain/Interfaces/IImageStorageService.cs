namespace Gifty.Domain.Interfaces;

public interface IImageStorageService
{
    /// <summary>
    /// Saves an uploaded file and returns a public URL.
    /// </summary>
    Task<string> SaveImageAsync(Stream stream, string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an image by its stored filename.
    /// </summary>
    Task DeleteImageAsync(string fileName, CancellationToken cancellationToken = default);
}