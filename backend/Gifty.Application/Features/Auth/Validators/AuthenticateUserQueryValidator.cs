using FluentValidation;
using Gifty.Application.Features.Auth.Queries;

namespace Gifty.Application.Features.Auth.Validators;

public class AuthenticateUserQueryValidator : AbstractValidator<AuthenticateUserQuery>
{
    public AuthenticateUserQueryValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Authentication token is required.")
            .MinimumLength(20).WithMessage("Token appears to be invalid."); // optional stricter check
    }
}