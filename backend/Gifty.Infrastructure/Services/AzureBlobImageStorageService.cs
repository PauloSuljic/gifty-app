using Azure.Storage.Blobs;
using Gifty.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Gifty.Infrastructure.Services;

public class AzureBlobImageStorageService : IImageStorageService
{
    private readonly BlobContainerClient _container;

    public AzureBlobImageStorageService(IConfiguration config)
    {
        var connectionString = config["AzureStorage:ConnectionString"];
        var containerName   = config["AzureStorage:ContainerName"];
        
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new Exception("❌ AzureStorage:ConnectionString is missing in configuration.");

        if (string.IsNullOrWhiteSpace(containerName))
            throw new Exception("❌ AzureStorage:ContainerName is missing in configuration.");
        
        _container = new BlobContainerClient(connectionString, containerName);
        _container.CreateIfNotExists();
    }

    public async Task<string> SaveImageAsync(
        Stream stream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);
        var blobName = $"{Guid.NewGuid()}{extension}";

        var blob = _container.GetBlobClient(blobName);

        // Determine correct MIME type
        var contentType = extension.ToLower() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png"            => "image/png",
            ".gif"            => "image/gif",
            _                 => "application/octet-stream"
        };

        var headers = new Azure.Storage.Blobs.Models.BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blob.UploadAsync(
            stream,
            new Azure.Storage.Blobs.Models.BlobUploadOptions
            {
                HttpHeaders = headers
            },
            cancellationToken
        );

        return blob.Uri.ToString();
    }

    public async Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;
        
        var fileName = Path.GetFileName(new Uri(imageUrl).LocalPath);

        var blob = _container.GetBlobClient(fileName);
        await blob.DeleteIfExistsAsync(cancellationToken: cancellationToken);
    }
    
}