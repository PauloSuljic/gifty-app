using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities; 
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.Wishlists.Commands;

public record DeleteWishlistCommand(Guid Id, string UserId) : IRequest<bool>;

public class DeleteWishlistHandler : IRequestHandler<DeleteWishlistCommand, bool>
{
    private readonly IWishlistRepository _wishlistRepository;

    public DeleteWishlistHandler(IWishlistRepository wishlistRepository)
    {
        _wishlistRepository = wishlistRepository;
    }

    public async Task<bool> Handle(DeleteWishlistCommand request, CancellationToken cancellationToken)
    {
        var existingWishlist = await _wishlistRepository.GetByIdAsync(request.Id);

        if (existingWishlist == null)
        {
            throw new NotFoundException(nameof(Wishlist), request.Id);
        }
        
        if (existingWishlist.UserId != request.UserId)
        {
            throw new ForbiddenAccessException("You are not authorized to delete this wishlist.");
        }
        
        await _wishlistRepository.DeleteAsync(existingWishlist);
        await _wishlistRepository.SaveChangesAsync();
        
        return true;
    }
}