<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Users table (email, cnic)
        Schema::table("users", function (Blueprint $table) {
            $table->dropUnique(["email"]);
            $table->dropUnique(["cnic"]);

            $table->unique(["email", "deleted_at"]);
            $table->unique(["cnic", "deleted_at"]);
        });

        // 2. Inventory Items table (sku)
        Schema::table("inventory_items", function (Blueprint $table) {
            $table->dropUnique(["sku"]);

            $table->unique(["sku", "deleted_at"]);
        });

        // 3. Certificates table (certificate_number)
        Schema::table("certificates", function (Blueprint $table) {
            $table->dropUnique(["certificate_number"]);

            $table->unique(["certificate_number", "deleted_at"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->dropUnique(["email", "deleted_at"]);
            $table->dropUnique(["cnic", "deleted_at"]);

            $table->unique("email");
            $table->unique("cnic");
        });

        Schema::table("inventory_items", function (Blueprint $table) {
            $table->dropUnique(["sku", "deleted_at"]);

            $table->unique("sku");
        });

        Schema::table("certificates", function (Blueprint $table) {
            $table->dropUnique(["certificate_number", "deleted_at"]);

            $table->unique("certificate_number");
        });
    }
};

