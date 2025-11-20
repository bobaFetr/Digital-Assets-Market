using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace UnitTests
{
    [TestClass]
    public class AntiXssTest
    {
        [TestMethod]
        public void TestScriptTagInjection()
        {
            string input = "<script>alert('XSS')</script>";
            string result = AntiXss.SanitizeInput(input);
            Assert.IsFalse(result.Contains("<script>"));
        }

        [TestMethod]
        public void TestEventHandlerInjection()
        {
            string input = "<img src=x onerror='alert(1)'>";
            string result = AntiXss.SanitizeInput(input);
            Assert.IsFalse(result.Contains("onerror"));
        }

        [TestMethod]
        public void TestHtmlEntityEncoding()
        {
            string input = "<div>Test & Content</div>";
            string result = AntiXss.SanitizeInput(input);
            Assert.IsTrue(result.Contains("&lt;") || result.Contains("&amp;"));
        }

        [TestMethod]
        public void TestJavaScriptProtocol()
        {
            string input = "<a href='javascript:alert(1)'>Click</a>";
            string result = AntiXss.SanitizeInput(input);
            Assert.IsFalse(result.Contains("javascript:"));
        }

        [TestMethod]
        public void TestSvgXssAttack()
        {
            string input = "<svg onload='alert(1)'></svg>";
            string result = AntiXss.SanitizeInput(input);
            Assert.IsFalse(result.Contains("onload"));
        }

        [TestMethod]
        public void TestCleanInputReturnsClean()
        {
            string input = "This is safe text";
            string result = AntiXss.SanitizeInput(input);
            Assert.AreEqual(input, result);
        }
    }
}