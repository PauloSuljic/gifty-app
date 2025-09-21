// Gifty.Application/Features/Wishlists/Queries/GetWishlistItemById.cs
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Queries;

public record GetWishlistItemByIdQuery(Guid Id, string UserId) : IRequest<WishlistItemDto>;

public class GetWishlistItemByIdHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<GetWishlistItemByIdQuery, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(GetWishlistItemByIdQuery request, CancellationToken cancellationToken)
    {
        var wishlistItem = await wishlistItemRepository.GetByIdAsync(request.Id);

        if (wishlistItem == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.Id);
        }
        
        var parentWishlist = await wishlistRepository.GetByIdAsync(wishlistItem.WishlistId);

        if (parentWishlist == null)
        {
            throw new NotFoundException($"Parent Wishlist for Item ({request.Id}) not found.");
        }
        
        if (parentWishlist.UserId != request.UserId && !parentWishlist.IsPublic)
        {
            throw new ForbiddenAccessException("You are not authorized to view this wishlist item.");
        }
        
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