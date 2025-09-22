using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities;
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record DeleteWishlistItemCommand(Guid Id, Guid WishlistId, string UserId) : IRequest<bool>;

public class DeleteWishlistItemHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<DeleteWishlistItemCommand, bool>
{
    public async Task<bool> Handle(DeleteWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var existingItem = await wishlistItemRepository.GetByIdAsync(request.Id);

        if (existingItem == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.Id);
        }
        
        var parentWishlist = await wishlistRepository.GetByIdAsync(existingItem.WishlistId);

        if (parentWishlist == null)
        {
            throw new NotFoundException($"Parent Wishlist for Item ({request.Id}) not found during deletion.");
        }
        
        if (parentWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to delete this wishlist item.");
        }
        
        existingItem.Delete();
        
        await wishlistItemRepository.DeleteAsync(existingItem);
        await wishlistItemRepository.SaveChangesAsync();
        
        return true;
    }
}