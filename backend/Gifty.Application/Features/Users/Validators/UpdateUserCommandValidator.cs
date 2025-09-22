using FluentValidation;
using Gifty.Application.Features.Users.Commands;

namespace Gifty.Application.Features.Users.Validators;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        // ID is always required
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required.");

        // Username optional, but if provided it must follow rules
        RuleFor(x => x.Username)
            .NotEmpty().When(x => x.Username != null)
            .MinimumLength(3).When(x => x.Username != null)
            .MaximumLength(30).When(x => x.Username != null)
            .Matches("^[a-zA-Z0-9_]+$").When(x => x.Username != null)
            .WithMessage("Username can only contain letters, numbers, and underscores.");

        // Bio optional but limited in length
        RuleFor(x => x.Bio)
            .MaximumLength(200).When(x => x.Bio != null);

        // AvatarUrl optional, but if provided must be a valid absolute URL
        RuleFor(x => x.AvatarUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .When(x => x.AvatarUrl != null)
            .WithMessage("AvatarUrl must be a valid URL.");
    }
}