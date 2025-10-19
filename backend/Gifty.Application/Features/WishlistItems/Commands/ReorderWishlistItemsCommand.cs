using Gifty.Application.Common.Exceptions;
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.WishlistItems.Dtos;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record ReorderWishlistItemsCommand(
    Guid WishlistId,
    string UserId,
    List<ReorderWishlistItemDto> ReorderedItems
) : IRequest<Unit>
{
    public class ReorderWishlistItemsCommandHandler(IWishlistItemRepository wishlistItemRepository)
        : IRequestHandler<ReorderWishlistItemsCommand, Unit>
    {
        public async Task<Unit> Handle(ReorderWishlistItemsCommand request, CancellationToken cancellationToken)
        {
            var itemIds = request.ReorderedItems.Select(r => r.Id).ToList();

            var wishlistItems = await wishlistItemRepository.GetAllByWishlistIdAsync(request.WishlistId);
            var itemsToUpdate = wishlistItems
                .Where(i => itemIds.Contains(i.Id))
                .ToList();

            if (itemsToUpdate.Count != request.ReorderedItems.Count)
            {
                throw new BadRequestException("One or more wishlist items in the reorder request are invalid or do not belong to the wishlist.");
            }

            foreach (var reorderedDto in request.ReorderedItems)
            {
                var item = itemsToUpdate.FirstOrDefault(i => i.Id == reorderedDto.Id);
                if (item != null)
                {
                    item.Reorder(reorderedDto.Order);
                    await wishlistItemRepository.UpdateAsync(item);
                }
            }

            await wishlistItemRepository.SaveChangesAsync();

            return Unit.Value;
        }
    }
}