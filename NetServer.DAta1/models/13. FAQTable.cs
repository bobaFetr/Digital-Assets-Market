using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class FAQ
    {
        [Key]
        public Guid FaqId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Guid CategoryId { get; set; }
        public Guid AuthorId { get; set; }
        public DateTime PublishedAt { get; set; }
    }
}