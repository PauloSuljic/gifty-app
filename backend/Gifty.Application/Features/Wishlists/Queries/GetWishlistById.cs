using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.Wishlists.Queries;

public record GetWishlistByIdQuery(Guid Id, string? UserId) : IRequest<WishlistDto>; 

public class GetWishlistByIdHandler(IWishlistRepository wishlistRepository)
    : IRequestHandler<GetWishlistByIdQuery, WishlistDto> 
{
    public async Task<WishlistDto> Handle(GetWishlistByIdQuery request, CancellationToken cancellationToken)
    {
        var wishlist = await wishlistRepository.GetByIdAsync(request.Id);

        if (wishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.Id);
        }
        
        if (!wishlist.IsPublic && wishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to view this private wishlist.");
        }

        var wishlistItemDtos = wishlist.Items.Select(item => new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId
        }).ToList();

        return new WishlistDto
        {
            Id = wishlist.Id,
            Name = wishlist.Name,
            IsPublic = wishlist.IsPublic,
            UserId = wishlist.UserId,
            CreatedAt = wishlist.CreatedAt,
            Order = wishlist.Order,
            Items = wishlistItemDtos
        };
    }
}