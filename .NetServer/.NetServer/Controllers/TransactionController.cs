using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WebApplication1.Controllers
{
    // Minimal DTO required by the controller
    public class TransactionDTO
    {
        public int Id { get; set; }
        // Add other properties as needed
    }

    // Minimal service interface to satisfy the controller's dependency
    //Piromnisi za tqh
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionDTO>> GetAllAsync();
        Task<TransactionDTO> GetByIdAsync(int id);
        Task<TransactionDTO> CreateAsync(TransactionDTO dto);
        Task<TransactionDTO> UpdateAsync(int id, TransactionDTO dto);
        Task<bool> DeleteAsync(int id);
    }

    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions = await _transactionService.GetAllAsync();
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionDTO transactionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _transactionService.CreateAsync(transactionDto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionDTO transactionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _transactionService.UpdateAsync(id, transactionDto);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _transactionService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}