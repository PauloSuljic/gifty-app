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
    public async Task<IEnumerable<WishlistItemDto>> Handle(GetAllWishlistItemsQuery request, CancellationToken cancellationToken)
    {
        var wishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);

        if (wishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.WishlistId);
        }

        var isOwner = wishlist.UserId == request.UserId;

        var items = await wishlistItemRepository.GetAllByWishlistIdAsync(request.WishlistId);

        var itemDtos = items.Select(item => new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId,
            IsOwner = isOwner,
            Order = item.Order,
            ImageUrl = item.ImageUrl
        }).OrderByDescending(i => i.Order).ToList();

        return itemDtos;
    }
}