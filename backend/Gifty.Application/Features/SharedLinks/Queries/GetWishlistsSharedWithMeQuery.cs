using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.SharedLinks.Dtos;
using Gifty.Application.Features.Wishlists.Dtos;

namespace Gifty.Application.Features.SharedLinks.Queries;

public record GetWishlistsSharedWithMeQuery(string UserId) : IRequest<List<SharedWithMeWishlistOwnerGroupDto>>;

public class GetWishlistsSharedWithMeHandler(ISharedLinkVisitRepository sharedLinkVisitRepository)
    : IRequestHandler<GetWishlistsSharedWithMeQuery, List<SharedWithMeWishlistOwnerGroupDto>>
{
    public async Task<List<SharedWithMeWishlistOwnerGroupDto>> Handle(GetWishlistsSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        var visitedWishlists = await sharedLinkVisitRepository.GetVisitsByUserIdAsync(request.UserId);
        
        var relevantVisits = visitedWishlists
            .Where(v => v.SharedLink is { Wishlist: not null } && v.SharedLink.Wishlist.UserId != request.UserId)
            .ToList();

        if (relevantVisits.Count == 0)
        {
            return [];
        }

        var result = relevantVisits
            .GroupBy(v => new
            {
                OwnerId = v.SharedLink!.Wishlist!.UserId,
                OwnerUsername = v.SharedLink.Wishlist.User?.Username,
                OwnerAvatarUrl = v.SharedLink.Wishlist.User?.AvatarUrl
            })
            .Select(group => new SharedWithMeWishlistOwnerGroupDto
            {
                OwnerId = group.Key.OwnerId,
                OwnerName = group.Key.OwnerUsername,
                OwnerAvatar = group.Key.OwnerAvatarUrl,
                Wishlists = group.Select(v => new SharedWithMeWishlistDto
                {
                    Id = v.SharedLink!.Wishlist!.Id,
                    Name = v.SharedLink.Wishlist.Name,
                    Items = v.SharedLink.Wishlist.Items
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
                }).ToList()
            }).ToList();

        return result;
    }
}