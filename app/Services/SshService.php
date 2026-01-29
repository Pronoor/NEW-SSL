<?php

namespace App\Services;

use phpseclib3\Net\SSH2;
use Exception;

class SshService
{
    private SSH2 $ssh;
    private string $host;
    private int $port;
    private string $username;
    private string $authType;
    private ?string $password;
    private ?string $privateKey;

    public function __construct(
        string $host,
        string $username,
        string $authType = 'password',
        ?string $password = null,
        ?string $privateKey = null,
        int $port = 22
    ) {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->authType = $authType;
        $this->password = $password;
        $this->privateKey = $privateKey;
    }

    public function connect(): bool
    {
        try {
            $this->ssh = new SSH2($this->host, $this->port);
            
            if ($this->authType === 'key' && $this->privateKey) {
                $key = \phpseclib3\Crypt\PublicKeyLoader::load($this->privateKey);
                if (!$this->ssh->login($this->username, $key)) {
                    throw new Exception('SSH key authentication failed');
                }
            } else {
                if (!$this->ssh->login($this->username, $this->password)) {
                    throw new Exception('SSH password authentication failed');
                }
            }
            
            return true;
        } catch (Exception $e) {
            throw new Exception("SSH connection failed: " . $e->getMessage());
        }
    }

    public function execute(string $command): array
    {
        if (!isset($this->ssh)) {
            $this->connect();
        }

        $output = $this->ssh->exec($command);
        $exitStatus = $this->ssh->getExitStatus();
        
        return [
            'output' => $output,
            'exit_status' => $exitStatus,
            'success' => $exitStatus === 0
        ];
    }

    public function testConnection(): bool
    {
        try {
            $result = $this->execute('echo "Connection test successful"');
            return $result['success'];
        } catch (Exception $e) {
            return false;
        }
    }

    public function isCertbotInstalled(): bool
    {
        try {
            $result = $this->execute('which certbot');
            return $result['success'] && !empty(trim($result['output']));
        } catch (Exception $e) {
            return false;
        }
    }

    public function installCertbot(): array
    {
        $commands = [
            'sudo apt update',
            'sudo snap install core; sudo snap refresh core',
            'sudo snap install --classic certbot',
            'sudo ln -sf /snap/bin/certbot /usr/bin/certbot || true'
        ];

        $results = [];
        foreach ($commands as $command) {
            $result = $this->execute($command);
            $results[] = [
                'command' => $command,
                'success' => $result['success'],
                'output' => $result['output']
            ];
            
            if (!$result['success']) {
                break;
            }
        }

        return $results;
    }

    public function checkWebServer(string $webServerType): bool
    {
        try {
            if ($webServerType === 'nginx') {
                $result = $this->execute('which nginx && systemctl is-active --quiet nginx');
            } else {
                $result = $this->execute('which apache2 && systemctl is-active --quiet apache2');
            }
            return $result['success'];
        } catch (Exception $e) {
            return false;
        }
    }

    public function requestCertificate(
        string $domain,
        string $email,
        string $webServerType,
        ?string $webrootPath = null
    ): array {
        $domains = explode(',', $domain);
        $domainFlags = implode(' -d ', array_map(function($d) {
            return '-d ' . trim($d);
        }, $domains));
        
        $command = "sudo certbot --{$webServerType} {$domainFlags} --email {$email} --agree-tos --no-eff-email --redirect --non-interactive";
        
        if ($webrootPath) {
            $command = "sudo certbot certonly --webroot -w {$webrootPath} {$domainFlags} --email {$email} --agree-tos --no-eff-email --non-interactive";
        }

        return $this->execute($command);
    }

    public function renewCertificate(): array
    {
        return $this->execute('sudo certbot renew --non-interactive');
    }

    public function getCertificateInfo(string $domain): array
    {
        $result = $this->execute("sudo certbot certificates | grep -A 10 '{$domain}'");
        
        if (!$result['success']) {
            return ['error' => 'Failed to get certificate info'];
        }

        // Parse certificate info
        $info = [];
        $output = $result['output'];
        
        // Extract expiration date
        if (preg_match('/Expiry Date: (.+)/', $output, $matches)) {
            $info['expires_at'] = $matches[1];
        }
        
        // Extract certificate paths
        if (preg_match('/Certificate Path: (.+)/', $output, $matches)) {
            $info['certificate_path'] = trim($matches[1]);
        }
        
        if (preg_match('/Private Key Path: (.+)/', $output, $matches)) {
            $info['private_key_path'] = trim($matches[1]);
        }

        return $info;
    }

    public function disconnect(): void
    {
        if (isset($this->ssh)) {
            $this->ssh->disconnect();
        }
    }

    public function __destruct()
    {
        $this->disconnect();
    }
}
