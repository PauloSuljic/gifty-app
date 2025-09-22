using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record UpdateWishlistItemCommand(
    Guid Id,
    Guid WishlistId,
    string UserId,
    string Name,
    string? Link,
    bool IsReserved,
    string? ReservedBy
) : IRequest<WishlistItemDto>;

public class UpdateWishlistItemHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<UpdateWishlistItemCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(UpdateWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var wishlistItem = await wishlistItemRepository.GetByIdAsync(request.Id);

        if (wishlistItem == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.Id);
        }
        
        if (wishlistItem.WishlistId != request.WishlistId)
        {
            throw new BadRequestException("Wishlist Item does not belong to the specified Wishlist.");
        }

        var parentWishlist = await wishlistRepository.GetByIdAsync(wishlistItem.WishlistId);

        if (parentWishlist == null)
        {
            throw new NotFoundException($"Parent Wishlist for Item ({request.Id}) not found during update.");
        }

        if (parentWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to update this wishlist item.");
        }

        wishlistItem.Update(request.Name, request.Link);

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
            WishlistId = wishlistItem.WishlistId
        };
    }
}