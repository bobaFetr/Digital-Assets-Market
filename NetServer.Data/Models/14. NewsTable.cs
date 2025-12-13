using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class NewsTable
    {
        public NewsTable()
        {
            NewsId = Guid.NewGuid();
            Title = string.Empty;
            Content = string.Empty;
            Author = string.Empty;
            PublishedAt = DateTime.UtcNow;
            CategoryId = 0;
            CreatedBy = string.Empty;
            EditedBy = string.Empty;
            EditedOn = DateTime.UtcNow;
            DeletedBy = string.Empty;
            DeletedOn = DateTime.UtcNow;
        }

        public NewsTable(Guid newsId, DateTime publishedAt) 
        { 
            NewsId = newsId;
            Readers = new HashSet<User>();
            PublishedAt = publishedAt;
        }
        [Key]
        public Guid NewsId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Author { get; set; }
        public DateTime PublishedAt { get; set; }
        
        // Foreign key example
        public int CategoryId { get; set; }

        public string CreatedBy { get; set; }

        public string EditedBy { get; set; }
        public DateTime EditedOn { get; set; }

        public string DeletedBy { get; set; }
        public DateTime DeletedOn { get; set; }
        //created by, modified on, modified by, deletd by, 
        // One-to-many example
        public virtual ICollection<User> Readers { get; set; }        
    }
}
