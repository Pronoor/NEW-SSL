<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'domain',
        'domains',
        'email',
        'server_ip',
        'server_hostname',
        'ssh_username',
        'ssh_auth_type',
        'ssh_password',
        'ssh_key',
        'web_server_type',
        'webroot_path',
        'auto_renew',
        'expires_at',
        'status',
        'certificate_path',
        'private_key_path',
        'full_chain_path',
        'error_message',
        'last_renewed_at',
    ];

    protected $casts = [
        'domains' => 'array',
        'auto_renew' => 'boolean',
        'expires_at' => 'date',
        'last_renewed_at' => 'datetime',
    ];

    protected $hidden = [
        'ssh_password',
        'ssh_key',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpiring(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        
        return $this->expires_at->diffInDays(Carbon::now()) <= 30;
    }

    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        
        return $this->expires_at->isPast();
    }

    public function updateStatus(): void
    {
        if ($this->isExpired()) {
            $this->status = 'expired';
        } elseif ($this->isExpiring()) {
            $this->status = 'expiring';
        } elseif ($this->status === 'pending' && $this->expires_at) {
            $this->status = 'active';
        }
        
        $this->save();
    }
}
