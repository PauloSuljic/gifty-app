﻿// <auto-generated />
using System;
using Gifty.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Gifty.Infrastructure.Migrations
{
    [DbContext(typeof(GiftyDbContext))]
    [Migration("20250321011424_InitialMigration")]
    partial class InitialMigration
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Gifty.Domain.Entities.SharedLink", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("ShareCode")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Guid>("WishlistId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("WishlistId");

                    b.ToTable("SharedLinks");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.SharedLinkVisit", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("SharedLinkId")
                        .HasColumnType("uuid");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("VisitedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("SharedLinkId");

                    b.ToTable("SharedLinkVisits");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("AvatarUrl")
                        .HasColumnType("text");

                    b.Property<string>("Bio")
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.Wishlist", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsPublic")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Wishlists");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.WishlistItem", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsReserved")
                        .HasColumnType("boolean");

                    b.Property<string>("Link")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ReservedBy")
                        .HasColumnType("text");

                    b.Property<Guid>("WishlistId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("WishlistId");

                    b.ToTable("WishlistItems");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.SharedLink", b =>
                {
                    b.HasOne("Gifty.Domain.Entities.Wishlist", "Wishlist")
                        .WithMany()
                        .HasForeignKey("WishlistId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Wishlist");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.SharedLinkVisit", b =>
                {
                    b.HasOne("Gifty.Domain.Entities.SharedLink", "SharedLink")
                        .WithMany()
                        .HasForeignKey("SharedLinkId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SharedLink");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.Wishlist", b =>
                {
                    b.HasOne("Gifty.Domain.Entities.User", "User")
                        .WithMany("Wishlists")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.WishlistItem", b =>
                {
                    b.HasOne("Gifty.Domain.Entities.Wishlist", "Wishlist")
                        .WithMany("Items")
                        .HasForeignKey("WishlistId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Wishlist");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.User", b =>
                {
                    b.Navigation("Wishlists");
                });

            modelBuilder.Entity("Gifty.Domain.Entities.Wishlist", b =>
                {
                    b.Navigation("Items");
                });
#pragma warning restore 612, 618
        }
    }
}
