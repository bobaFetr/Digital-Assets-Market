using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class FeeTable
    {
        public Guid FeeTableId { get; set; }
        public string Symbol { get; set; }
        public string FeeType { get; set; }
        public decimal FeeAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}