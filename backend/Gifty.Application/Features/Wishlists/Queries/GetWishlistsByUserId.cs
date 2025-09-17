using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;

namespace Gifty.Application.Features.Wishlists.Queries;

public record GetWishlistsByUserIdQuery(string UserId) : IRequest<List<WishlistDto>>;

public class GetWishlistsByUserIdHandler : IRequestHandler<GetWishlistsByUserIdQuery, List<WishlistDto>>
{
    private readonly IWishlistRepository _wishlistRepository;

    public GetWishlistsByUserIdHandler(IWishlistRepository wishlistRepository)
    {
        _wishlistRepository = wishlistRepository;
    }

    public async Task<List<WishlistDto>> Handle(GetWishlistsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var wishlists = await _wishlistRepository.GetAllByUserIdAsync(request.UserId);

        var enumerable = wishlists.ToList();
        if (enumerable.Count == 0)
        {
            return [];
        }

        // Map the entities to DTOs
        var wishlistDtos = enumerable.Select(wishlist => new WishlistDto
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