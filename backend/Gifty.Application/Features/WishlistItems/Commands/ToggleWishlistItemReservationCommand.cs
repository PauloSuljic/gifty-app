using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record ToggleWishlistItemReservationCommand(
    Guid ItemId,
    Guid WishlistId,
    string UserId
) : IRequest<WishlistItemDto>;

public class ToggleWishlistItemReservationHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository,
    IUserRepository userRepository)
    : IRequestHandler<ToggleWishlistItemReservationCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(ToggleWishlistItemReservationCommand request, CancellationToken cancellationToken)
    {
        var item = await wishlistItemRepository.GetByIdAsync(request.ItemId);

        if (item == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);
        }
        
        if (item.WishlistId != request.WishlistId)
        {
            throw new BadRequestException("Wishlist item not found in the specified wishlist.");
        }
        
        var wishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);
        if (wishlist == null)
        {
            throw new NotFoundException($"Parent Wishlist for Item ({request.ItemId}) not found.");
        }
        
        var wishlistItems = await wishlistItemRepository.GetAllByWishlistIdAsync(request.WishlistId);

        var hasReservedItem = wishlistItems.Any(i => i.IsReserved && i.ReservedBy == request.UserId);
        if (!item.IsReserved && hasReservedItem)
        {
            throw new BadRequestException("You can only reserve 1 item per wishlist.");
        }
        
        // Use internal user GUID directly (Firebase UID is only for login)
        item.ToggleReservation(request.UserId);

        await wishlistItemRepository.UpdateAsync(item);
        await wishlistItemRepository.SaveChangesAsync();

        return new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId
        };
    }
}