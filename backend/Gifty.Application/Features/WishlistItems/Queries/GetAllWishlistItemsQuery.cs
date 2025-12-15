using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Queries;

public record GetAllWishlistItemsQuery(Guid WishlistId, string? UserId) : IRequest<IEnumerable<WishlistItemDto>>;

public class GetAllWishlistItemsHandler(
    IWishlistRepository wishlistRepository,
    IWishlistItemRepository wishlistItemRepository)
    : IRequestHandler<GetAllWishlistItemsQuery, IEnumerable<WishlistItemDto>>
{
    public async Task<IEnumerable<WishlistItemDto>> Handle(
        GetAllWishlistItemsQuery request,
        CancellationToken cancellationToken)
    {
        var wishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);

        if (wishlist == null)
            throw new NotFoundException(nameof(Wishlist), request.WishlistId);

        var userId = request.UserId;              // can be null
        var isAuthenticated = userId != null;
        var isOwner = isAuthenticated && wishlist.UserId == userId;

        var items = await wishlistItemRepository
            .GetAllByWishlistIdAsync(request.WishlistId);

        return items
            .OrderByDescending(i => i.Order)
            .Select(item => new WishlistItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Link = item.Link,
                ImageUrl = item.ImageUrl,
                CreatedAt = item.CreatedAt,
                WishlistId = item.WishlistId,
                Order = item.Order,

                // ✅ Visible to everyone
                IsReserved = item.IsReserved,

                // 🔒 Optional: show only to owner / authenticated users
                ReservedBy = isOwner ? item.ReservedBy : null,

                IsOwner = isOwner
            })
            .ToList();
    }
}