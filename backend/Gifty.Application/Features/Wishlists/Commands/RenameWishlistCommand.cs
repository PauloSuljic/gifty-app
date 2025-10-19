using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.Wishlists.Commands;

public record RenameWishlistCommand(Guid Id, string UserId, string NewName) : IRequest<WishlistDto>;

public class RenameWishlistHandler(IWishlistRepository wishlistRepository)
    : IRequestHandler<RenameWishlistCommand, WishlistDto>
{
    public async Task<WishlistDto> Handle(RenameWishlistCommand request, CancellationToken cancellationToken)
    {
        var existingWishlist = await wishlistRepository.GetByIdAsync(request.Id);

        if (existingWishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.Id);
        }

        if (existingWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to rename this wishlist.");
        }
        
        existingWishlist.Rename(request.NewName);

        await wishlistRepository.UpdateAsync(existingWishlist);
        await wishlistRepository.SaveChangesAsync();
        
        return new WishlistDto
        {
            Id = existingWishlist.Id,
            Name = existingWishlist.Name,
            IsPublic = existingWishlist.IsPublic,
            UserId = existingWishlist.UserId,
            CreatedAt = existingWishlist.CreatedAt,
            Order = existingWishlist.Order,
            Items = existingWishlist.Items.Select(item => new WishlistItemDto 
            {
                Id = item.Id,
                Name = item.Name,
                Link = item.Link,
                IsReserved = item.IsReserved,
                ReservedBy = item.ReservedBy,
                CreatedAt = item.CreatedAt,
                WishlistId = item.WishlistId
            }).ToList()
        };
    }
}