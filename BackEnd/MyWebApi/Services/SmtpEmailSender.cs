using System.Net;
using System.Net.Mail;

namespace MyWebApi.Services;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string body)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var fromEmail = _configuration["Email:From"];
        var port = int.TryParse(_configuration["Email:SmtpPort"], out var parsedPort) ? parsedPort : 587;
        var enableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var parsedSsl) ? parsedSsl : true;

        if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new InvalidOperationException("Email service is not configured.");
        }

        using var client = new SmtpClient(smtpHost, port)
        {
            EnableSsl = enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = string.IsNullOrWhiteSpace(smtpUser),
            Credentials = string.IsNullOrWhiteSpace(smtpUser)
                ? CredentialCache.DefaultNetworkCredentials
                : new NetworkCredential(smtpUser, smtpPassword)
        };

        using var message = new MailMessage(fromEmail, toEmail, subject, body);

        try
        {
            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}.", toEmail);
            throw;
        }
    }
}
