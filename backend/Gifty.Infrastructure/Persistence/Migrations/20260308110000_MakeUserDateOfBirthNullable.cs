using System;
using Gifty.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gifty.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(GiftyDbContext))]
    [Migration("20260308110000_MakeUserDateOfBirthNullable")]
    public partial class MakeUserDateOfBirthNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Users",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM "Users" WHERE "DateOfBirth" IS NULL) THEN
                        RAISE EXCEPTION 'Cannot revert MakeUserDateOfBirthNullable migration: Users.DateOfBirth contains NULL values.';
                    END IF;
                END $$;
                """);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Users",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);
        }
    }
}
