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
                throw new BadRequestException("Invalid wishlist IDs for reorder.");
            
            for (int i = 0; i < request.ReorderedWishlists.Count; i++)
            {
                var dto = request.ReorderedWishlists[i];
                var wishlist = wishlistsToUpdate.FirstOrDefault(w => w.Id == dto.Id);
                if (wishlist != null)
                    wishlist.Reorder(request.ReorderedWishlists.Count - 1 - i);
            }

            await wishlistRepository.SaveChangesAsync();

            return Unit.Value;
        }
    }
}