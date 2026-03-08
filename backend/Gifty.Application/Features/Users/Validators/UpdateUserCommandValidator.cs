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

        // Username is optional on update. When provided, validate basic length bounds.
        RuleFor(x => x.Username)
            .MinimumLength(2)
            .MaximumLength(60)
            .When(x => !string.IsNullOrWhiteSpace(x.Username));

        // Bio optional but limited in length
        RuleFor(x => x.Bio)
            .MaximumLength(200).When(x => x.Bio != null);

        // AvatarUrl optional, but if provided must be a valid absolute URL
        RuleFor(x => x.AvatarUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .When(x => x.AvatarUrl != null)
            .WithMessage("AvatarUrl must be a valid URL.");

        RuleFor(x => x.DateOfBirth)
            .Must(x => x == null || x != DateOnly.MinValue)
            .WithMessage("DateOfBirth must be a valid date.");
    }
}
