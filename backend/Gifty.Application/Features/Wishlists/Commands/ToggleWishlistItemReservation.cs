using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.Wishlists.Commands;

public record ToggleWishlistItemReservationCommand(
    Guid ItemId,
    Guid WishlistId,
    string UserId
) : IRequest<WishlistItemDto>;

public class ToggleWishlistItemReservationHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<ToggleWishlistItemReservationCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(ToggleWishlistItemReservationCommand request, CancellationToken cancellationToken)
    {
        var item = await wishlistItemRepository.GetByIdAsync(request.ItemId);

        if (item == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);
        }

        // Validate that the item belongs to the specified wishlist
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

        if (item.IsReserved)
        {
            if (item.ReservedBy != request.UserId)
            {
                throw new ForbiddenAccessException("You cannot unreserve an item reserved by someone else.");
            }
            item.IsReserved = false;
            item.ReservedBy = null;
        }
        else
        {
            var hasReservedItem = wishlistItems.Any(i => i.IsReserved && i.ReservedBy == request.UserId);
            if (hasReservedItem)
            {
                throw new BadRequestException("You can only reserve 1 item per wishlist.");
            }

            item.IsReserved = true;
            item.ReservedBy = request.UserId;
        }

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