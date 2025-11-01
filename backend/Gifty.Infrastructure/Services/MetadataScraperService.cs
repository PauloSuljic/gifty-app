using AngleSharp;
using Gifty.Domain.Interfaces;

namespace Gifty.Infrastructure.Services;

public class MetadataScraperService : IMetadataScraperService
{
    private readonly HttpClient _httpClient;
    public MetadataScraperService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string?> GetPreviewImageAsync(string url)
    {
        try
        {
            var html = await _httpClient.GetStringAsync(url);
            var context = BrowsingContext.New(Configuration.Default);
            var document = await context.OpenAsync(req => req.Content(html));

            var ogImage = document.QuerySelector("meta[property='og:image']")?.GetAttribute("content");
            var twitterImage = document.QuerySelector("meta[name='twitter:image']")?.GetAttribute("content");

            return ogImage ?? twitterImage;
        }
        catch
        {
            return null;
        }
    }
}