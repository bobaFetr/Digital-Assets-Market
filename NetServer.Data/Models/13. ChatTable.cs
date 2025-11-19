using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class ChatTable
    {
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
