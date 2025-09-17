// Gifty.Application/Features/Wishlists/Commands/UpdateWishlist.cs

using Gifty.Application.Common.Exceptions;
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.Wishlists.Commands;

public record UpdateWishlistCommand(
    Guid Id, 
    string UserId, 
    string Name, 
    bool IsPublic,
    int Order
) : IRequest<WishlistDto?>;

public class UpdateWishlistHandler : IRequestHandler<UpdateWishlistCommand, WishlistDto?>
{
    private readonly IWishlistRepository _wishlistRepository;

    public UpdateWishlistHandler(IWishlistRepository wishlistRepository)
    {
        _wishlistRepository = wishlistRepository;
    }

    public async Task<WishlistDto?> Handle(UpdateWishlistCommand request, CancellationToken cancellationToken)
    {
        var existingWishlist = await _wishlistRepository.GetByIdAsync(request.Id);

        if (existingWishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.Id);
        }
        
        if (existingWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to update this wishlist.");
        }
        
        existingWishlist.Name = request.Name;
        existingWishlist.IsPublic = request.IsPublic;
        existingWishlist.Order = request.Order;
        
        await _wishlistRepository.UpdateAsync(existingWishlist);
        await _wishlistRepository.SaveChangesAsync();
        
        return new WishlistDto
        {
            Id = existingWishlist.Id,
            Name = existingWishlist.Name,
            IsPublic = existingWishlist.IsPublic,
            UserId = existingWishlist.UserId,
            CreatedAt = existingWishlist.CreatedAt,
            Order = existingWishlist.Order,
            Items = new List<WishlistItemDto>()
        };
    }
}