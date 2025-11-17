using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace ChatTableNameSpace
{
    public class ChatTable
    {
        [Key]
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        // Navigation properties
        public virtual User Sender { get; set; }
        public virtual User Receiver { get; set; }


        //public ICloneable<User> Users { get; set; }
        public ICollection<User> Users { get; set; }
    }
}
