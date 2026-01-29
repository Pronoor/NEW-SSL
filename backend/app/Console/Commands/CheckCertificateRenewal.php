<?php

namespace App\Console\Commands;

use App\Models\Certificate;
use App\Services\CertificateInstallationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckCertificateRenewal extends Command
{
    protected $signature = 'certificates:check-renewal';
    protected $description = 'Check and renew certificates that are expiring soon';

    public function handle(CertificateInstallationService $installationService)
    {
        $this->info('Checking certificates for renewal...');

        // Find certificates expiring in 30 days or less
        $expiringCertificates = Certificate::where('auto_renew', true)
            ->where('status', '!=', 'failed')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', Carbon::now()->addDays(30))
            ->get();

        $this->info("Found {$expiringCertificates->count()} certificates to renew");

        foreach ($expiringCertificates as $certificate) {
            $this->info("Renewing certificate for domain: {$certificate->domain}");
            
            $result = $installationService->renew($certificate);
            
            if ($result['success']) {
                $this->info("✓ Successfully renewed certificate for {$certificate->domain}");
                
                // Send email notification (implement email service)
                // Mail::to($certificate->user->email)->send(new CertificateRenewed($certificate));
            } else {
                $this->error("✗ Failed to renew certificate for {$certificate->domain}: {$result['message']}");
            }
        }

        $this->info('Renewal check completed');
    }
}
