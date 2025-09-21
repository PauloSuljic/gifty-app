using MediatR;
using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record CreateWishlistItemCommand(
    Guid WishlistId,
    string UserId,
    string Name,
    string? Link
) : IRequest<WishlistItemDto>;

public class CreateWishlistItemHandler(
    IWishlistRepository wishlistRepository,
    IWishlistItemRepository wishlistItemRepository)
    : IRequestHandler<CreateWishlistItemCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(CreateWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var parentWishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);

        if (parentWishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.WishlistId);
        }
        
        if (parentWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to add items to this wishlist.");
        }
        
        var newItem = new WishlistItem
        {
            Id = Guid.NewGuid(),
            WishlistId = request.WishlistId,
            Name = request.Name,
            Link = request.Link,
            IsReserved = false,
            ReservedBy = null, 
            CreatedAt = DateTime.UtcNow
        };
        
        await wishlistItemRepository.AddAsync(newItem);
        await wishlistItemRepository.SaveChangesAsync();
        
        return new WishlistItemDto
        {
            Id = newItem.Id,
            Name = newItem.Name,
            Link = newItem.Link,
            IsReserved = newItem.IsReserved,
            ReservedBy = newItem.ReservedBy,
            CreatedAt = newItem.CreatedAt,
            WishlistId = newItem.WishlistId
        };
    }
}