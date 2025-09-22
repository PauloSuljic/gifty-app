using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.SharedLinks.Dtos;

namespace Gifty.Application.Features.SharedLinks.Commands;

public record GenerateShareLinkCommand(Guid WishlistId, string UserId) : IRequest<ShareLinkResponseDto>;

public class GenerateShareLinkHandler(
    IWishlistRepository wishlistRepository,
    ISharedLinkRepository sharedLinkRepository)
    : IRequestHandler<GenerateShareLinkCommand, ShareLinkResponseDto>
{
    public async Task<ShareLinkResponseDto> Handle(GenerateShareLinkCommand request, CancellationToken cancellationToken)
    {
        var wishlist = await wishlistRepository.GetByIdAsync(request.WishlistId);
        if (wishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.WishlistId);
        }

        if (wishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not the owner of this wishlist.");
        }
        
        var existingLink = await sharedLinkRepository.GetByWishlistIdAsync(request.WishlistId);
        if (existingLink != null)
        {
            return new ShareLinkResponseDto(existingLink.ShareCode);
        }
        
        var newSharedLink = new SharedLink(request.WishlistId);

        await sharedLinkRepository.AddAsync(newSharedLink);
        await sharedLinkRepository.SaveChangesAsync();

        return new ShareLinkResponseDto(newSharedLink.ShareCode);
    }
}