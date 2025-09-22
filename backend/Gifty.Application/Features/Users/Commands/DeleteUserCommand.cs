using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities.Users;
using FluentValidation;

namespace Gifty.Application.Features.Users.Commands;

public record DeleteUserCommand(string Id) : IRequest<bool>
{
    public class DeleteUserCommandHandler(IUserRepository userRepository) : IRequestHandler<DeleteUserCommand, bool>
    {
        public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var userToDelete = await userRepository.GetByIdAsync(request.Id);

            if (userToDelete == null)
            {
                throw new NotFoundException(nameof(User), request.Id);
            }

            // Important: This only deletes the user from YOUR database.
            // It DOES NOT delete their Firebase account.
            // If full Firebase account deletion is required, that would be a separate (and more complex) operation
            // involving the Firebase Admin SDK, potentially initiated from the client or with more explicit user confirmation.
            
            userToDelete.MarkAsDeleted();
            
            await userRepository.DeleteAsync(userToDelete);
            await userRepository.SaveChangesAsync();

            return true;
        }
    }
}

public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand>
{
    public DeleteUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("User Id is required.");
    }
}