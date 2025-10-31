using MediatR;
using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record CreateWishlistItemCommand(
    Guid WishlistId,
    string UserId,
    string Name,
    string? Link,
    int Order
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
        
        var maxOrder = await wishlistItemRepository.GetMaxOrderAsync(request.WishlistId);
        
        var newItem = WishlistItem.Create(request.WishlistId, request.Name, request.Link, maxOrder + 1);
        
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
            WishlistId = newItem.WishlistId,
            Order = newItem.Order
        };
    }
}