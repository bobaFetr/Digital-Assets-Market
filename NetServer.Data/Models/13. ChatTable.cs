using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class ChatTable
    {
        public ChatTable()
        {
            ChatId = Guid.NewGuid();
            SenderId = Guid.NewGuid();
            ReceiverId = Guid.NewGuid();
            Message = string.Empty;
            Timestamp = DateTime.UtcNow;
            Sender = new User();
            Receiver = new User();
            MessageSendDate = DateTime.UtcNow;
            MessageEdit = DateTime.UtcNow;
            MessageDeleted = DateTime.UtcNow;
        }

        public ChatTable(Guid chatId, DateTime timestamp)
        {
            ChatId = chatId;
            Users = new HashSet<User>();
            Timestamp = timestamp;
        }
        [Key]
        public Guid ChatId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        // Navigation properties
        public virtual User Sender { get; set; }
        public virtual User Receiver { get; set; }

        public DateTime MessageSendDate { get; set; }

        public DateTime MessageEdit { get; set; }

        public DateTime MessageDeleted { get; set; }
        //created by, modified on, modified by, deletd by, 

        //public ICloneable<User> Users { get; set; }
        public ICollection<User> Users { get; set; }
    }
}
