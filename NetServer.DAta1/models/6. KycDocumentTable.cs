using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class KycDocument
    {
        [Key]
        public Guid DocId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }  // FK to User
        public User User { get; set; } = null!;  // Navigation property
        
        public string Type { get; set; }
        public string FilePath { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;

        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}