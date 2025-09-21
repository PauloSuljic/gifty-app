using FluentValidation;
using Gifty.Application.Features.Users.Commands;

namespace Gifty.Application.Features.Users.Validators;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        // ID is required (client must provide Firebase UID or internal ID)
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required.");

        // Username rules
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
            .MaximumLength(30).WithMessage("Username cannot exceed 30 characters.")
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores.");

        // Email rules
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.");
    }
}