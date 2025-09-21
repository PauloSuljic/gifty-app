using Gifty.Application.Common.Exceptions;
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Wishlists.Dtos;

namespace Gifty.Application.Features.Wishlists.Commands;

public record ReorderWishlistsCommand(
    string UserId,
    List<ReorderWishlistDto> ReorderedWishlists
) : IRequest<Unit>
{
    public class ReorderWishlistsCommandHandler(IWishlistRepository wishlistRepository)
        : IRequestHandler<ReorderWishlistsCommand, Unit>
    {
        public async Task<Unit> Handle(ReorderWishlistsCommand request, CancellationToken cancellationToken)
        {
            var wishlistIds = request.ReorderedWishlists.Select(r => r.Id).ToList();

            var userWishlists = await wishlistRepository.GetAllByUserIdAsync(request.UserId);
            var wishlistsToUpdate = userWishlists
                .Where(w => wishlistIds.Contains(w.Id))
                .ToList();

            if (wishlistsToUpdate.Count != request.ReorderedWishlists.Count)
            {
                throw new BadRequestException("One or more wishlists in the reorder request are invalid or do not belong to the user.");
            }

            foreach (var reorderedDto in request.ReorderedWishlists)
            {
                var wishlist = wishlistsToUpdate.FirstOrDefault(w => w.Id == reorderedDto.Id);
                if (wishlist != null)
                {
                    wishlist.Order = reorderedDto.Order;
                    await wishlistRepository.UpdateAsync(wishlist);
                }
            }

            await wishlistRepository.SaveChangesAsync();

            return Unit.Value;
        }
    }
}