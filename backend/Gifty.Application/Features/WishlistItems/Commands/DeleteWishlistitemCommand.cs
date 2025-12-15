using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities;
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record DeleteWishlistItemCommand(
    Guid ItemId,
    Guid WishlistId,
    string UserId
) : IRequest;

public class DeleteWishlistItemHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<DeleteWishlistItemCommand>
{
    public async Task Handle(DeleteWishlistItemCommand request, CancellationToken cancellationToken)
    {
        // 1️⃣ Load item
        var item = await wishlistItemRepository.GetByIdAsync(request.ItemId);
        if (item is null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);
        }

        // 2️⃣ Ensure item belongs to wishlist from route
        if (item.WishlistId != request.WishlistId)
        {
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);
        }

        // 3️⃣ Load wishlist for ownership check
        var wishlist = await wishlistRepository.GetByIdAsync(item.WishlistId);
        if (wishlist is null)
        {
            throw new NotFoundException(nameof(Wishlist), item.WishlistId);
        }

        // 4️⃣ Ownership check (hide existence if not owner)
        if (wishlist.UserId != request.UserId)
        {
            throw new NotFoundException(nameof(WishlistItem), request.ItemId);
        }

        // 5️⃣ Delete item
        await wishlistItemRepository.DeleteAsync(item);
        await wishlistItemRepository.SaveChangesAsync();

        // 6️⃣ Reorder remaining items
        var remainingItems = await wishlistItemRepository.GetAllByWishlistIdAsync(wishlist.Id);
        var ordered = remainingItems
            .OrderBy(i => i.Order)
            .ToList();

        for (int i = 0; i < ordered.Count; i++)
        {
            ordered[i].Reorder(i);
            await wishlistItemRepository.UpdateAsync(ordered[i]);
        }

        await wishlistItemRepository.SaveChangesAsync();
    }
}