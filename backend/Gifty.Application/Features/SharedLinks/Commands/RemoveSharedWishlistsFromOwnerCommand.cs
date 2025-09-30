using MediatR;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities;

namespace Gifty.Application.Features.SharedLinks.Commands;

public record RemoveSharedWishlistsFromOwnerCommand(string CurrentUserId, string OwnerId) : IRequest<Unit>;

public class RemoveSharedWishlistsFromOwnerHandler(
    ISharedLinkRepository sharedLinkRepository)
    : IRequestHandler<RemoveSharedWishlistsFromOwnerCommand, Unit>
{
    public async Task<Unit> Handle(RemoveSharedWishlistsFromOwnerCommand request, CancellationToken cancellationToken)
    {
        // Fetch all shared links between this owner and the current user
        var links = await sharedLinkRepository.GetByOwnerAndUserAsync(request.OwnerId, request.CurrentUserId);

        if (links == null || !links.Any())
        {
            throw new NotFoundException(nameof(SharedLink), request.OwnerId);
        }

        // Remove all links
        sharedLinkRepository.RemoveRange(links);
        await sharedLinkRepository.SaveChangesAsync();

        return Unit.Value;
    }
}