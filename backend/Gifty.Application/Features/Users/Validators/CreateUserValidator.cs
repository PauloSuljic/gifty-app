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

        // Full name / username rules
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(2).WithMessage("Username must be at least 2 characters long.")
            .MaximumLength(60).WithMessage("Username cannot exceed 60 characters.");

        // Email rules
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.");
    }
}
