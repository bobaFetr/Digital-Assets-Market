using System.Net;
using System.Text.RegularExpressions;

namespace MyWebApi.Services;

public static class RequestSecurity
{
    private static readonly Regex UnsafeHtmlPattern = new(
        @"<\s*/?\s*(script|img|svg|iframe|object|embed|link|style|meta)|on\w+\s*=|javascript:|vbscript:|data:\s*text/html",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex SupportedDataImagePattern = new(
        @"^data:image\/(png|jpe?g|gif|webp);base64,",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static bool TryValidatePlainText(string? value, string fieldName, out string normalized, out string error, int maxLength = 0)
    {
        normalized = NormalizePlainText(value);
        error = string.Empty;

        if (maxLength > 0 && normalized.Length > maxLength)
        {
            error = $"{fieldName} must be {maxLength} characters or fewer.";
            return false;
        }

        if (ContainsUnsafeMarkup(normalized))
        {
            error = $"{fieldName} cannot contain HTML or script content.";
            return false;
        }

        return true;
    }

    public static bool TryValidateImageReference(string? value, string fieldName, out string? normalized, out string error)
    {
        normalized = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(normalized))
        {
            return true;
        }

        if (SupportedDataImagePattern.IsMatch(normalized))
        {
            return true;
        }

        if (normalized.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            error = $"{fieldName} supports only PNG, JPG, GIF, or WEBP base64 images.";
            return false;
        }

        if (!Uri.TryCreate(normalized, UriKind.Absolute, out var parsedUri)
            || (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
        {
            error = $"{fieldName} must be an absolute http/https URL or a supported data:image base64 value.";
            return false;
        }

        var decoded = WebUtility.HtmlDecode(normalized);
        if (ContainsUnsafeMarkup(decoded))
        {
            error = $"{fieldName} contains an unsafe image reference.";
            return false;
        }

        return true;
    }

    private static string NormalizePlainText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return value
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n')
            .Trim();
    }

    private static bool ContainsUnsafeMarkup(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var decoded = WebUtility.HtmlDecode(value);
        return decoded.Contains('<')
            || decoded.Contains('>')
            || UnsafeHtmlPattern.IsMatch(decoded);
    }
}
