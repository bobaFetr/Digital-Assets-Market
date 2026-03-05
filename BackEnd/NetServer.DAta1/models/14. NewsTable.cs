using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class NewsTable
    {
        [Key]
        public Guid NewsId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public Guid Author { get; set; }
    
        public DateTime PublishedAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }

        public Guid EditedBy { get; set; }
        public DateTime EditedOn { get; set; }

        public Guid DeletedBy { get; set; }
        public DateTime DeletedOn { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}