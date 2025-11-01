namespace Gifty.Domain.Interfaces;

public interface IMetadataScraperService
{
    Task<string?> GetPreviewImageAsync(string url);
}