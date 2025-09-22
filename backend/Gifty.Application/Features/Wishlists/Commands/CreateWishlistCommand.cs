using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Wishlists.Commands;

public record CreateWishlistCommand(
    string UserId,
    string Name,
    bool IsPublic,
    int? Order
) : IRequest<WishlistDto>;

public class CreateWishlistCommandHandler(IWishlistRepository wishlistRepository)
    : IRequestHandler<CreateWishlistCommand, WishlistDto>
{
    public async Task<WishlistDto> Handle(CreateWishlistCommand request, CancellationToken cancellationToken)
    {
        var newWishlist = Wishlist.Create(
            request.Name,
            request.UserId,
            request.IsPublic,
            request.Order ?? 0
        );

        await wishlistRepository.AddAsync(newWishlist);
        await wishlistRepository.SaveChangesAsync();

        return new WishlistDto
        {
            Id = newWishlist.Id,
            Name = newWishlist.Name,
            IsPublic = newWishlist.IsPublic,
            UserId = newWishlist.UserId,
            CreatedAt = newWishlist.CreatedAt,
            Order = newWishlist.Order,
            Items = new List<WishlistItemDto>()
        };
    }
}