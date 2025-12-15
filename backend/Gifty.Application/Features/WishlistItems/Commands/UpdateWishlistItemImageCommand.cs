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
    string FileName,
    string? Name,
    string? Link
) : IRequest<WishlistItemDto>;

public class UpdateWishlistItemImageHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository,
    IImageStorageService imageStorageService
) : IRequestHandler<UpdateWishlistItemImageCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(UpdateWishlistItemImageCommand request, CancellationToken cancellationToken)
    {
        var item = await wishlistItemRepository.GetByIdAsync(request.ItemId)
            ?? throw new NotFoundException(nameof(WishlistItem), request.ItemId);

        if (item.WishlistId != request.WishlistId)
            throw new BadRequestException("Item does not belong to this wishlist.");

        var wishlist = await wishlistRepository.GetByIdAsync(item.WishlistId)
            ?? throw new NotFoundException("Parent wishlist not found.");

        if (wishlist.UserId != request.UserId)
            throw new ForbiddenAccessException();

        if (!string.IsNullOrWhiteSpace(item.ImageUrl))
            await imageStorageService.DeleteImageAsync(item.ImageUrl, cancellationToken);

        var newUrl = await imageStorageService.SaveImageAsync(
            request.ImageStream,
            request.FileName,
            cancellationToken
        );
        
        if (!string.IsNullOrWhiteSpace(request.Name) || !string.IsNullOrWhiteSpace(request.Link))
        {
            item.Update(
                request.Name ?? item.Name,
                request.Link ?? item.Link,
                item.Description
            );
        }

        item.SetImageUrl(newUrl);
        await wishlistItemRepository.UpdateAsync(item);
        await wishlistItemRepository.SaveChangesAsync();

        return new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            Order = item.Order,
            ImageUrl = item.ImageUrl,
            Description = item.Description
        };
    }
}