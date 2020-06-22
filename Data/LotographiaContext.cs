using Lotographia.Models;
using Microsoft.EntityFrameworkCore;

namespace Lotographia.Data
{
    public class LotographiaContext : DbContext
    {
        public LotographiaContext(DbContextOptions<LotographiaContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var mistletoeGame = modelBuilder.Entity<MistletoeGame>();

            mistletoeGame.Property(b => b.Code)
                .IsRequired()
                .HasMaxLength(255);

            mistletoeGame.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(255);

            mistletoeGame.Property(b => b.Description)
                .HasMaxLength(4000);

            mistletoeGame.Property(b => b.CharacterLimit)
                .IsRequired();

            mistletoeGame.Property(b => b.Settings)
                .IsRequired();

            mistletoeGame.Property(b => b.CreatedDate)
                .IsRequired()
                .HasColumnType("datetime2")
                .HasDefaultValueSql("getdate()");

            mistletoeGame.Property(b => b.EndedDate)
                .HasColumnType("datetime2");

            mistletoeGame.HasIndex(b => b.Code)
                .IsUnique();

            var mistletoeParticipant = modelBuilder.Entity<MistletoeParticipant>();

            mistletoeParticipant.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(255);

            mistletoeParticipant.Property(b => b.Biography)
                .HasMaxLength(4000);

            mistletoeParticipant.Property(b => b.HashedPassword)
                .HasMaxLength(255);

            mistletoeParticipant.Property(b => b.Settings)
                .IsRequired();

            mistletoeParticipant.Property(b => b.Version)
                .IsRequired()
                .HasDefaultValue(0);

            mistletoeParticipant.HasOne(a => a.PrecedingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
            
            mistletoeParticipant.HasOne(a => a.FollowingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<MistletoeGame> MistletoeGames { get; set; }
        public DbSet<MistletoeParticipant> MistletoeParticipants { get; set; }
    }
}
