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

            mistletoeGame.Property(b => b.Token)
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

            mistletoeGame.Property(b => b.PublishedDate)
                .HasColumnType("datetime2");

            mistletoeGame.HasIndex(b => b.Token)
                .IsUnique();

            var mistletoePlayer = modelBuilder.Entity<MistletoePlayer>();

            mistletoePlayer.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(255);

            mistletoePlayer.Property(b => b.Biography)
                .HasMaxLength(4000);

            mistletoePlayer.Property(b => b.HashedPassword)
                .HasMaxLength(255);

            mistletoePlayer.Property(b => b.Settings)
                .IsRequired();

            mistletoePlayer.Property(b => b.Version)
                .IsRequired()
                .HasDefaultValue(0);

            mistletoePlayer.HasOne(a => a.PrecedingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
            
            mistletoePlayer.HasOne(a => a.FollowingPlayer)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<MistletoeGame> MistletoeGames { get; set; }
        public DbSet<MistletoePlayer> MistletoePlayers { get; set; }
    }
}
