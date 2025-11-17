namespace DAM
{
    public class NewsTable
    {
        [Key]
        public int NewsId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Author { get; set; }
        public DateTime PublishedAt { get; set; }
        
        // Foreign key example
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; }
        
        // One-to-many example
        public virtual ICollection<User> Readers { get; set; }
        
    }
}
