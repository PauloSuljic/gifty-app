using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.SharedLinks.Dtos;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities; 

namespace Gifty.Application.Features.SharedLinks.Queries;

public record GetSharedWishlistQuery(string ShareCode, string? CurrentUserId) : IRequest<SharedWishlistResponseDto>;

public class GetSharedWishlistHandler(
    ISharedLinkRepository sharedLinkRepository,
    ISharedLinkVisitRepository sharedLinkVisitRepository)
    : IRequestHandler<GetSharedWishlistQuery, SharedWishlistResponseDto>
{
    public async Task<SharedWishlistResponseDto> Handle(GetSharedWishlistQuery request, CancellationToken cancellationToken)
    {
        var sharedLink = await sharedLinkRepository.GetByShareCodeAsync(request.ShareCode);

        if (sharedLink == null || sharedLink.Wishlist == null)
        {
            throw new NotFoundException("Invalid shared link or associated wishlist not found.");
        }
        
        if (!string.IsNullOrEmpty(request.CurrentUserId) && request.CurrentUserId != sharedLink.Wishlist.UserId)
        {
            var existingVisit = await sharedLinkVisitRepository.GetVisitByUserAndSharedLinkAsync(request.CurrentUserId, sharedLink.Id);

            if (existingVisit == null)
            {
                var newVisit = new SharedLinkVisit
                {
                    Id = Guid.NewGuid(),
                    SharedLinkId = sharedLink.Id,
                    UserId = request.CurrentUserId,
                    VisitedAt = DateTime.UtcNow
                };
                await sharedLinkVisitRepository.AddAsync(newVisit);
                await sharedLinkVisitRepository.SaveChangesAsync();
            }
        }

        return new SharedWishlistResponseDto
        {
            Id = sharedLink.Wishlist.Id,
            Name = sharedLink.Wishlist.Name,
            OwnerId = sharedLink.Wishlist.UserId,
            OwnerName = sharedLink.Wishlist.User?.Username, 
            OwnerAvatar = sharedLink.Wishlist.User?.AvatarUrl,
            Items = sharedLink.Wishlist.Items
                .Select(i => new WishlistItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Link = i.Link,
                    IsReserved = i.IsReserved,
                    ReservedBy = i.ReservedBy,
                    CreatedAt = i.CreatedAt,
                    WishlistId = i.WishlistId
                }).ToList()
        };
    }
}