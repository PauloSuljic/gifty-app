namespace gifty_web_backend.DTOs;

public class ShareLinkResponseDto(string shareCode)
{
    public string ShareCode { get; set; } = shareCode;
}