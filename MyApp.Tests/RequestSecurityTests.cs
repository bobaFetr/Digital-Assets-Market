using MyWebApi.Services;

namespace MyApp.Tests;

public class RequestSecurityTests
{
    [Test]
    public void TryValidatePlainText_TrimsAndNormalizesSafeText()
    {
        var isValid = RequestSecurity.TryValidatePlainText("  Hello\r\nWorld  ", "Message", out var normalized, out var error, 50);

        Assert.That(isValid, Is.True);
        Assert.That(normalized, Is.EqualTo("Hello\nWorld"));
        Assert.That(error, Is.Empty);
    }

    [Test]
    public void TryValidatePlainText_RejectsHtmlContent()
    {
        var isValid = RequestSecurity.TryValidatePlainText("<script>alert(1)</script>", "Message", out _, out var error, 50);

        Assert.That(isValid, Is.False);
        Assert.That(error, Is.EqualTo("Message cannot contain HTML or script content."));
    }

    [Test]
    public void TryValidateImageReference_AllowsHttpsUrl()
    {
        var isValid = RequestSecurity.TryValidateImageReference("https://example.com/test.png", "Image", out var normalized, out var error);

        Assert.That(isValid, Is.True);
        Assert.That(normalized, Is.EqualTo("https://example.com/test.png"));
        Assert.That(error, Is.Empty);
    }

    [Test]
    public void TryValidateImageReference_RejectsUnsupportedDataImageType()
    {
        var isValid = RequestSecurity.TryValidateImageReference("data:image/svg+xml;base64,AAA", "Image", out _, out var error);

        Assert.That(isValid, Is.False);
        Assert.That(error, Is.EqualTo("Image supports only PNG, JPG, GIF, or WEBP base64 images."));
    }
}
