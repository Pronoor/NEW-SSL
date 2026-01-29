<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('domain');
            $table->text('domains')->nullable(); // JSON array for multiple domains
            $table->string('email');
            $table->string('server_ip');
            $table->string('server_hostname')->nullable();
            $table->string('ssh_username');
            $table->enum('ssh_auth_type', ['password', 'key'])->default('password');
            $table->text('ssh_password')->nullable(); // Encrypted
            $table->text('ssh_key')->nullable(); // Encrypted
            $table->enum('web_server_type', ['nginx', 'apache'])->default('nginx');
            $table->string('webroot_path')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->date('expires_at')->nullable();
            $table->enum('status', ['pending', 'active', 'expiring', 'expired', 'failed'])->default('pending');
            $table->text('certificate_path')->nullable();
            $table->text('private_key_path')->nullable();
            $table->text('full_chain_path')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('last_renewed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
