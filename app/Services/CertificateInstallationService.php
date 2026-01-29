<?php

namespace App\Services;

use App\Models\Certificate;
use Illuminate\Support\Facades\Log;
use Exception;

class CertificateInstallationService
{
    private SshService $sshService;

    public function install(Certificate $certificate): array
    {
        try {
            // Decrypt credentials
            $password = $certificate->ssh_auth_type === 'password' 
                ? decrypt($certificate->ssh_password) 
                : null;
            $privateKey = $certificate->ssh_auth_type === 'key' 
                ? decrypt($certificate->ssh_key) 
                : null;

            // Initialize SSH connection
            $this->sshService = new SshService(
                $certificate->server_ip,
                $certificate->ssh_username,
                $certificate->ssh_auth_type,
                $password,
                $privateKey
            );

            // Test connection
            if (!$this->sshService->testConnection()) {
                throw new Exception('Failed to connect to server');
            }

            // Check/install Certbot
            if (!$this->sshService->isCertbotInstalled()) {
                $installResult = $this->sshService->installCertbot();
                if (!$installResult[count($installResult) - 1]['success']) {
                    throw new Exception('Failed to install Certbot');
                }
            }

            // Check web server
            if (!$this->sshService->checkWebServer($certificate->web_server_type)) {
                throw new Exception("Web server ({$certificate->web_server_type}) is not running");
            }

            // Request certificate
            $domain = is_array($certificate->domains) 
                ? implode(',', $certificate->domains) 
                : $certificate->domain;
            
            $result = $this->sshService->requestCertificate(
                $domain,
                $certificate->email,
                $certificate->web_server_type,
                $certificate->webroot_path
            );

            if (!$result['success']) {
                throw new Exception('Certificate request failed: ' . $result['output']);
            }

            // Get certificate info
            $certInfo = $this->sshService->getCertificateInfo($certificate->domain);
            
            // Update certificate record
            $certificate->status = 'active';
            if (isset($certInfo['expires_at'])) {
                $certificate->expires_at = \Carbon\Carbon::parse($certInfo['expires_at']);
            }
            if (isset($certInfo['certificate_path'])) {
                $certificate->certificate_path = $certInfo['certificate_path'];
            }
            if (isset($certInfo['private_key_path'])) {
                $certificate->private_key_path = $certInfo['private_key_path'];
            }
            $certificate->save();

            return [
                'success' => true,
                'message' => 'Certificate installed successfully',
                'certificate' => $certificate
            ];

        } catch (Exception $e) {
            Log::error('Certificate installation failed', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);

            $certificate->status = 'failed';
            $certificate->error_message = $e->getMessage();
            $certificate->save();

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function renew(Certificate $certificate): array
    {
        try {
            // Decrypt credentials
            $password = $certificate->ssh_auth_type === 'password' 
                ? decrypt($certificate->ssh_password) 
                : null;
            $privateKey = $certificate->ssh_auth_type === 'key' 
                ? decrypt($certificate->ssh_key) 
                : null;

            // Initialize SSH connection
            $this->sshService = new SshService(
                $certificate->server_ip,
                $certificate->ssh_username,
                $certificate->ssh_auth_type,
                $password,
                $privateKey
            );

            // Renew certificate
            $result = $this->sshService->renewCertificate();

            if (!$result['success']) {
                throw new Exception('Certificate renewal failed: ' . $result['output']);
            }

            // Get updated certificate info
            $certInfo = $this->sshService->getCertificateInfo($certificate->domain);
            
            // Update certificate record
            if (isset($certInfo['expires_at'])) {
                $certificate->expires_at = \Carbon\Carbon::parse($certInfo['expires_at']);
            }
            $certificate->last_renewed_at = now();
            $certificate->updateStatus();
            $certificate->save();

            return [
                'success' => true,
                'message' => 'Certificate renewed successfully',
                'certificate' => $certificate
            ];

        } catch (Exception $e) {
            Log::error('Certificate renewal failed', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);

            $certificate->error_message = $e->getMessage();
            $certificate->save();

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
