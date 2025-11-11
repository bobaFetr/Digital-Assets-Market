namespace FeeTableNameSpace
{
    public class Fee
    {
        //[Key]
        public Guid FeeId { get; set; }
        public string Symbol { get; set; }
        public decimal MakerFee { get; set; }
        public decimal TakerFee { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

}