using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class FeeTable
    {
        [Key]
        public Guid FeeTableId { get; set; }
        [Required]
        public string Symbol { get; set; } = string.Empty;
        [Required]
        public string FeeType { get; set; } = string.Empty;
        public decimal FeeAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<OrdersTable> Orders { get; set; } = new List<OrdersTable>();
    }
}