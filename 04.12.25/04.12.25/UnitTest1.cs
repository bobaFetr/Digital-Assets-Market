//namespace _04._12._25
//{
//    public class Tests
//    {
//        [SetUp]
//        public void Setup()
//        {
//        }

//        [Test]
//        public void Test1()
//        {
//            Assert.Pass();
//        }
//    }
//}


using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ApiRequestDemo
{
    // DTOs (Swagger-style)
    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class AuthorRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime BirthDate { get; set; }
        public DateTime DeathDate { get; set; }
        public string Nationality { get; set; }
        public string Biography { get; set; }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            using var client = new HttpClient();

            // 1. Register request
            var registerUrl = "https://localhost:7065/api/Auth/register";
            var registerPayload = new RegisterRequest
            {
                Username = "Bobata",
                Email = "user@example.com",
                Password = "bobata07admin"
            };

            var registerJson = JsonSerializer.Serialize(registerPayload);
            var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
            var registerResponse = await client.PostAsync(registerUrl, registerContent);
            Console.WriteLine("Register Response:");
            Console.WriteLine(await registerResponse.Content.ReadAsStringAsync());

            // 2. Authors request
            var authorsUrl = "https://localhost:7065/api/Authors";
            var authorsPayload = new AuthorRequest
            {
                FirstName = "string",
                LastName = "string",
                BirthDate = DateTime.Parse("2025-12-04T07:05:38.212Z"),
                DeathDate = DateTime.Parse("2025-12-04T07:05:38.212Z"),
                Nationality = "string",
                Biography = "string"
            };

            var authorsJson = JsonSerializer.Serialize(authorsPayload);
            var authorsContent = new StringContent(authorsJson, Encoding.UTF8, "application/json");

            // Add Authorization header
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                );

            var authorsResponse = await client.PostAsync(authorsUrl, authorsContent);
            Console.WriteLine("Authors Response:");
            Console.WriteLine(await authorsResponse.Content.ReadAsStringAsync());
        }
    }
}
