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
            var paperFolliesGame = modelBuilder.Entity<PaperFolliesGame>();

            paperFolliesGame.Property(b => b.Code)
                .IsRequired()
                .HasMaxLength(255);

            paperFolliesGame.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(255);

            paperFolliesGame.Property(b => b.Description)
                .HasMaxLength(4000);

            paperFolliesGame.Property(b => b.CreatedDate)
                .IsRequired()
                .HasColumnType("datetime2")
                .HasDefaultValueSql("getdate()");

            paperFolliesGame.Property(b => b.EndedDate)
                .HasColumnType("datetime2");

            paperFolliesGame.HasIndex(b => b.Code)
                .IsUnique();

            var paperFolliesParticipant = modelBuilder.Entity<PaperFolliesParticipant>();

            paperFolliesParticipant.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(255);

            paperFolliesParticipant.Property(b => b.Biography)
                .HasMaxLength(4000);

            paperFolliesParticipant.Property(b => b.HashedPassword)
                .HasMaxLength(255);

            paperFolliesParticipant.Property(b => b.Content)
                .HasMaxLength(4000);

            paperFolliesParticipant.HasOne(a => a.PrecedingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
            
            paperFolliesParticipant.HasOne(a => a.FollowingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<PaperFolliesGame> PaperFolliesGames { get; set; }
        public DbSet<PaperFolliesParticipant> PaperFolliesParticipants { get; set; }
    }
}
