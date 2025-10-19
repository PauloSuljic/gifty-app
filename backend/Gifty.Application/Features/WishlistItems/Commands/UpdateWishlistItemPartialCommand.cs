using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.WishlistItems.Commands;

public record UpdateWishlistItemPartialCommand(
    Guid Id,
    Guid WishlistId,
    string UserId,
    string? Name, 
    string? Link 
) : IRequest<WishlistItemDto>;

public class UpdateWishlistItemPartialHandler(
    IWishlistItemRepository wishlistItemRepository,
    IWishlistRepository wishlistRepository)
    : IRequestHandler<UpdateWishlistItemPartialCommand, WishlistItemDto>
{
    public async Task<WishlistItemDto> Handle(UpdateWishlistItemPartialCommand request, CancellationToken cancellationToken)
    {
        var item = await wishlistItemRepository.GetByIdAsync(request.Id);

        if (item == null)
        {
            throw new NotFoundException(nameof(WishlistItem), request.Id);
        }
        
        if (item.WishlistId != request.WishlistId)
        {
            throw new BadRequestException("Wishlist item not found in the specified wishlist.");
        }

        var parentWishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);
        if (parentWishlist == null)
        {
            throw new NotFoundException($"Parent Wishlist for Item ({request.Id}) not found.");
        }
        
        if (parentWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to edit this wishlist item.");
        }

        if (request.Name != null || request.Link != null)
        {
            item.UpdatePartial(request.Name, request.Link);
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