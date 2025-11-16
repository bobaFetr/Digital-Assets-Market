namespace DAM
{
    public class FAQTable
    {
        public int FaqId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}