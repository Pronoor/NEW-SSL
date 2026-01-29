<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\CertificateInstallationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    private CertificateInstallationService $installationService;

    public function __construct(CertificateInstallationService $installationService)
    {
        $this->installationService = $installationService;
    }

    public function index(Request $request)
    {
        $certificates = $request->user()
            ->certificates()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cert) {
                $cert->updateStatus();
                return $cert;
            });

        return response()->json([
            'certificates' => $certificates,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain' => 'required|string|max:255',
            'domains' => 'nullable|array',
            'domains.*' => 'string|max:255',
            'email' => 'required|email|max:255',
            'server_ip' => 'required|ip',
            'server_hostname' => 'nullable|string|max:255',
            'ssh_username' => 'required|string|max:255',
            'ssh_auth_type' => 'required|in:password,key',
            'ssh_password' => 'required_if:ssh_auth_type,password|string',
            'ssh_key' => 'required_if:ssh_auth_type,key|string',
            'web_server_type' => 'required|in:nginx,apache',
            'webroot_path' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Encrypt sensitive data
        $encryptedPassword = $request->ssh_auth_type === 'password' 
            ? Crypt::encryptString($request->ssh_password) 
            : null;
        $encryptedKey = $request->ssh_auth_type === 'key' 
            ? Crypt::encryptString($request->ssh_key) 
            : null;

        $certificate = Certificate::create([
            'user_id' => $request->user()->id,
            'domain' => $request->domain,
            'domains' => $request->domains ?? [$request->domain],
            'email' => $request->email,
            'server_ip' => $request->server_ip,
            'server_hostname' => $request->server_hostname,
            'ssh_username' => $request->ssh_username,
            'ssh_auth_type' => $request->ssh_auth_type,
            'ssh_password' => $encryptedPassword,
            'ssh_key' => $encryptedKey,
            'web_server_type' => $request->web_server_type,
            'webroot_path' => $request->webroot_path,
            'status' => 'pending',
        ]);

        // Install certificate in background (you can use a job queue here)
        try {
            $result = $this->installationService->install($certificate);
            
            if (!$result['success']) {
                return response()->json([
                    'message' => 'Certificate creation started but installation failed',
                    'certificate' => $certificate,
                    'error' => $result['message'],
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to install certificate',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Certificate created and installed successfully',
            'certificate' => $certificate->fresh(),
        ], 201);
    }

    public function show(Request $request, Certificate $certificate)
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate->updateStatus();

        return response()->json([
            'certificate' => $certificate,
        ]);
    }

    public function destroy(Request $request, Certificate $certificate)
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate->delete();

        return response()->json([
            'message' => 'Certificate deleted successfully',
        ]);
    }

    public function renew(Request $request, Certificate $certificate)
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $result = $this->installationService->renew($certificate);

        if (!$result['success']) {
            return response()->json([
                'message' => 'Certificate renewal failed',
                'error' => $result['message'],
            ], 500);
        }

        return response()->json([
            'message' => 'Certificate renewed successfully',
            'certificate' => $certificate->fresh(),
        ]);
    }

    public function toggleAutoRenew(Request $request, Certificate $certificate)
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate->auto_renew = !$certificate->auto_renew;
        $certificate->save();

        return response()->json([
            'message' => 'Auto-renewal ' . ($certificate->auto_renew ? 'enabled' : 'disabled'),
            'certificate' => $certificate,
        ]);
    }

    public function details(Request $request, Certificate $certificate)
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $certificate->updateStatus();

        return response()->json([
            'certificate' => $certificate,
            'details' => [
                'domain' => $certificate->domain,
                'domains' => $certificate->domains,
                'status' => $certificate->status,
                'expires_at' => $certificate->expires_at,
                'is_expiring' => $certificate->isExpiring(),
                'is_expired' => $certificate->isExpired(),
                'auto_renew' => $certificate->auto_renew,
                'last_renewed_at' => $certificate->last_renewed_at,
                'server_ip' => $certificate->server_ip,
                'web_server_type' => $certificate->web_server_type,
            ],
        ]);
    }
}
