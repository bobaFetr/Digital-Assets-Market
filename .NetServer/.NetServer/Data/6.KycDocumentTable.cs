using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace DAM
{
    public class KycDocument
    {
        [Key]
        public int DocId { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; }
        public string FilePath { get; set; }
        public string Status { get; set; }
        public DateTime SubmittedAt { get; set; }

        public User User { get; set; }
    }

}