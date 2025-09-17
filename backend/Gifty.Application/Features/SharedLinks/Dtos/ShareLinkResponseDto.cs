namespace Gifty.Application.Features.SharedLinks.Dtos;

public class ShareLinkResponseDto(string shareCode)
{
    public string ShareCode { get; set; } = shareCode;
}