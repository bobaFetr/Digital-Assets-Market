using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace FAQTableNameSpace
{
    public class FAQTable
    {
        [Key]
        public int FaqId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property for the relationship
        public int CategoryId { get; set; }
        

        public virtual ICollection<User> Readers { get; set; }
    }
}
