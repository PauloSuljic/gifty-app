using MediatR;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record UpdateWishlistItemImageCommand(
    Guid WishlistId,
    Guid ItemId,
    string UserId,
    Stream ImageStream,
    string FileName
) : IRequest<WishlistItemDto>;

public class UpdateWishlistItemImageHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository,
    IImageStorageService imageStorageService
) : IRequestHandler<UpdateWishlistItemImageCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(UpdateWishlistItemImageCommand request, CancellationToken cancellationToken)
    {
        var wishlistItem = await wishlistItemRepository.GetByIdAsync(request.ItemId);

        if (wishlistItem == null)
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);

        if (wishlistItem.WishlistId != request.WishlistId)
            throw new BadRequestException("Wishlist item does not belong to the specified wishlist.");

        var parentWishlist = await wishlistRepository.GetByIdAsync(wishlistItem.WishlistId);

        if (parentWishlist == null)
            throw new NotFoundException($"Parent wishlist for item ({request.ItemId}) not found during image update.");

        if (parentWishlist.UserId != request.UserId)
            throw new ForbiddenAccessException("You are not authorized to update this wishlist item's image.");

        // ✅ Store file using your chosen service (Local, S3, Azure Blob…)
        var imageUrl = await imageStorageService.SaveImageAsync(
            request.ImageStream,
            request.FileName,
            cancellationToken
        );

        // ✅ Save URL
        wishlistItem.SetImageUrl(imageUrl);

        await wishlistItemRepository.UpdateAsync(wishlistItem);
        await wishlistItemRepository.SaveChangesAsync();

        return new WishlistItemDto
        {
            Id = wishlistItem.Id,
            Name = wishlistItem.Name,
            Link = wishlistItem.Link,
            IsReserved = wishlistItem.IsReserved,
            ReservedBy = wishlistItem.ReservedBy,
            CreatedAt = wishlistItem.CreatedAt,
            WishlistId = wishlistItem.WishlistId,
            Order = wishlistItem.Order,
            ImageUrl = wishlistItem.ImageUrl
        };
    }
}