using System.ComponentModel.DataAnnotations;

namespace Gifty.Domain.Entities
{
    public class SystemSetting
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Key { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Value { get; set; } = null!;
    }
}