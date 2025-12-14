using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record UpdateWishlistItemPartialCommand(
    Guid Id,
    Guid WishlistId,
    string UserId,
    string? Name,
    string? Link,
    string? Description,
    Stream? ImageStream,
    string? FileName
) : IRequest<WishlistItemDto>;

public class UpdateWishlistItemPartialHandler : IRequestHandler<UpdateWishlistItemPartialCommand, WishlistItemDto>
{
    private readonly IWishlistItemRepository _wishlistItemRepository;
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IImageStorageService _imageStorage;

    public UpdateWishlistItemPartialHandler(
        IWishlistItemRepository wishlistItemRepository,
        IWishlistRepository wishlistRepository,
        IImageStorageService imageStorage)
    {
        _wishlistItemRepository = wishlistItemRepository;
        _wishlistRepository = wishlistRepository;
        _imageStorage = imageStorage;
    }

    public async Task<WishlistItemDto> Handle(UpdateWishlistItemPartialCommand request, CancellationToken cancellationToken)
    {
        var item = await _wishlistItemRepository.GetByIdAsync(request.Id);
        if (item == null)
            throw new NotFoundException(nameof(WishlistItem), request.Id);

        if (item.WishlistId != request.WishlistId)
            throw new BadRequestException("Wishlist item not found in this wishlist.");

        var wishlist = await _wishlistRepository.GetByIdAsync(request.WishlistId);
        if (wishlist == null)
            throw new NotFoundException("Parent wishlist not found.");

        if (wishlist.UserId != request.UserId)
            throw new ForbiddenAccessException("Not authorized to edit this item.");
        
        if (request.Name != null || request.Link != null)
        {
            var newName = request.Name ?? item.Name;
            var newLink = request.Link ?? item.Link;

            item.Update(newName, newLink);
        }
        
        if (request.Description != null)
        {
            item.SetDescription(request.Description);
        }
        
        if (request.ImageStream != null && request.FileName != null)
        {
            if (!string.IsNullOrWhiteSpace(item.ImageUrl))
                await _imageStorage.DeleteImageAsync(item.ImageUrl, cancellationToken);

            var newUrl = await _imageStorage.SaveImageAsync(
                request.ImageStream,
                request.FileName,
                cancellationToken
            );

            item.SetImageUrl(newUrl);
        }

        await _wishlistItemRepository.UpdateAsync(item);
        await _wishlistItemRepository.SaveChangesAsync();

        return new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId,
            ImageUrl = item.ImageUrl,
            Description = item.Description,
            Order = item.Order
        };
    }
}