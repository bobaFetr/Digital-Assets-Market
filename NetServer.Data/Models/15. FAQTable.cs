using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class FAQTable
    {
        public FAQTable()
        { 
            FaqId = Guid.NewGuid();
            Question = string.Empty;
            Answer = string.Empty;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            CategoryId = Guid.NewGuid();
            Author = new User();
            PublishedAt = DateTime.UtcNow;
            CreatedBy = new User();
            EditedOn = DateTime.UtcNow;
            EditedBy = new User();
            DeletedOn = new User();
        } 

        public FAQTable(Guid faqId, DateTime createdAt)
        {
            FaqId = faqId;
            Readers = new HashSet<User>();
            CreatedAt = createdAt;
        }
        [Key]
        public Guid FaqId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property for the relationship
        public Guid CategoryId { get; set; }
        public User Author { get; set; }
        public DateTime PublishedAt { get; set; }

        // Foreign key example
        

        public User CreatedBy { get; set; }

        public User EditedBy { get; set; }
        public DateTime EditedOn { get; set; }

        public User DeletedBy { get; set; }
        public User DeletedOn { get; set; }

        public virtual ICollection<User> Readers { get; set; }
    }
}
