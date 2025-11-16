namespace DAM
{
    public class ChatTable
    {
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}