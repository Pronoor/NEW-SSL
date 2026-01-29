<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Certificate;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $certificates = $user->certificates()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cert) {
                $cert->updateStatus();
                return $cert;
            });

        $stats = [
            'total' => $certificates->count(),
            'active' => $certificates->where('status', 'active')->count(),
            'expiring' => $certificates->where('status', 'expiring')->count(),
            'expired' => $certificates->where('status', 'expired')->count(),
            'pending' => $certificates->where('status', 'pending')->count(),
            'failed' => $certificates->where('status', 'failed')->count(),
        ];

        return response()->json([
            'user' => $user,
            'stats' => $stats,
            'certificates' => $certificates,
        ]);
    }
}
