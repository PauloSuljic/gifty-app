using Gifty.Application.Features.WishlistItems.Dtos;
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;

namespace Gifty.Application.Features.Wishlists.Queries;

public record  GetWishlistsByUserIdQuery(string UserId) : IRequest<List<WishlistDto>>;

public class GetWishlistsByUserIdHandler(IWishlistRepository wishlistRepository)
    : IRequestHandler<GetWishlistsByUserIdQuery, List<WishlistDto>>
{
    public async Task<List<WishlistDto>> Handle(GetWishlistsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var wishlists = (await wishlistRepository.GetAllByUserIdAsync(request.UserId))
            .OrderByDescending(r => r.Order).ToList();
        
        if (wishlists.Count == 0)
        {
            return [];
        }

        // Map the entities to DTOs
        var wishlistDtos = wishlists.Select(wishlist => new WishlistDto
        {
            Id = wishlist.Id,
            Name = wishlist.Name,
            IsPublic = wishlist.IsPublic,
            UserId = wishlist.UserId,
            CreatedAt = wishlist.CreatedAt,
            Order = wishlist.Order,
            Items = wishlist.Items.Select(item => new WishlistItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Link = item.Link,
                IsReserved = item.IsReserved,
                ReservedBy = item.ReservedBy,
                CreatedAt = item.CreatedAt,
                WishlistId = item.WishlistId
            }).ToList()
        }).ToList();

        return wishlistDtos;
    }
}