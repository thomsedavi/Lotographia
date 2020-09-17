﻿// <auto-generated />
using System;
using Lotographia.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Lotographia.Migrations
{
    [DbContext(typeof(LotographiaContext))]
    [Migration("20200912220454_CreateLexicologerGame")]
    partial class CreateLexicologerGame
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Lotographia.Models.LexicologerGame", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CharacterLimit")
                        .HasColumnType("int");

                    b.Property<string>("Details")
                        .HasColumnType("nvarchar(4000)")
                        .HasMaxLength(4000);

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(255)")
                        .HasMaxLength(255);

                    b.Property<string>("Words")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("LexicologerGames");
                });

            modelBuilder.Entity("Lotographia.Models.PaperFolliesGame", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CharacterLimit")
                        .HasColumnType("int");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasColumnType("nvarchar(255)")
                        .HasMaxLength(255);

                    b.Property<DateTime>("CreatedDate")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime2")
                        .HasDefaultValueSql("getdate()");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(4000)")
                        .HasMaxLength(4000);

                    b.Property<DateTime?>("EndedDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("Flags")
                        .HasColumnType("int");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("nvarchar(255)")
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("Code")
                        .IsUnique();

                    b.ToTable("PaperFolliesGames");
                });

            modelBuilder.Entity("Lotographia.Models.PaperFolliesParticipant", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Biography")
                        .HasColumnType("nvarchar(4000)")
                        .HasMaxLength(4000);

                    b.Property<string>("Content")
                        .HasColumnType("nvarchar(4000)")
                        .HasMaxLength(4000);

                    b.Property<int>("ContentIndex")
                        .HasColumnType("int");

                    b.Property<int>("ContentVersion")
                        .HasColumnType("int");

                    b.Property<int>("Flags")
                        .HasColumnType("int");

                    b.Property<long?>("FollowingPlayerId")
                        .HasColumnType("bigint");

                    b.Property<long>("GameId")
                        .HasColumnType("bigint");

                    b.Property<string>("HashedPassword")
                        .HasColumnType("nvarchar(255)")
                        .HasMaxLength(255);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(255)")
                        .HasMaxLength(255);

                    b.Property<long?>("PrecedingPlayerId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("FollowingPlayerId")
                        .IsUnique()
                        .HasFilter("[FollowingPlayerId] IS NOT NULL");

                    b.HasIndex("GameId");

                    b.HasIndex("PrecedingPlayerId")
                        .IsUnique()
                        .HasFilter("[PrecedingPlayerId] IS NOT NULL");

                    b.ToTable("PaperFolliesParticipants");
                });

            modelBuilder.Entity("Lotographia.Models.PaperFolliesParticipant", b =>
                {
                    b.HasOne("Lotographia.Models.PaperFolliesParticipant", "FollowingPlayer")
                        .WithOne()
                        .HasForeignKey("Lotographia.Models.PaperFolliesParticipant", "FollowingPlayerId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Lotographia.Models.PaperFolliesGame", "Game")
                        .WithMany("Participants")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Lotographia.Models.PaperFolliesParticipant", "PrecedingPlayer")
                        .WithOne()
                        .HasForeignKey("Lotographia.Models.PaperFolliesParticipant", "PrecedingPlayerId")
                        .OnDelete(DeleteBehavior.Restrict);
                });
#pragma warning restore 612, 618
        }
    }
}
