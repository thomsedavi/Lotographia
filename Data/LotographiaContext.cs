using Lotographia.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

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

            var lexicologerGame = modelBuilder.Entity<LexicologerGame>();

            lexicologerGame.Property(b => b.Title)
                .HasMaxLength(255);

            lexicologerGame.Property(b => b.Details)
                .HasMaxLength(4000);

            var valueComparer = new ValueComparer<List<LexicologerWord>>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            lexicologerGame.Property(g => g.Words)
                .HasConversion(w => JsonConvert.SerializeObject(w), w => JsonConvert.DeserializeObject<List<LexicologerWord>>(w))
                .Metadata.SetValueComparer(valueComparer);

            var tovelundGame = modelBuilder.Entity<TovelundGame>();

            tovelundGame.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(255);

            tovelundGame.Property(b => b.Design)
                .IsRequired()
                .HasMaxLength(4000);
        }

        public DbSet<PaperFolliesGame> PaperFolliesGames { get; set; }
        public DbSet<PaperFolliesParticipant> PaperFolliesParticipants { get; set; }
        public DbSet<LexicologerGame> LexicologerGames { get; set; }
        public DbSet<TovelundGame> TovelundGames { get; set; }
    }
}
