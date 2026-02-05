<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $totalUsers = User::count();
        $totalCertificates = Certificate::count();
        $activeCertificates = Certificate::where('status', 'active')->count();
        $expiringCertificates = Certificate::whereIn('status', ['expiring', 'expired'])->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_certificates' => $totalCertificates,
                'active_certificates' => $activeCertificates,
                'expiring_certificates' => $expiringCertificates,
            ],
        ]);
    }

    public function users(Request $request)
    {
        $users = User::withCount('certificates')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
                    'created_at' => $user->created_at?->toIso8601String(),
                    'certificates_count' => $user->certificates_count,
                ];
            });

        return response()->json(['users' => $users]);
    }

    public function certificates(Request $request)
    {
        $certificates = Certificate::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cert) {
                $cert->updateStatus();
                return [
                    'id' => $cert->id,
                    'domain' => $cert->domain,
                    'domains' => $cert->domains,
                    'status' => $cert->status,
                    'expires_at' => $cert->expires_at?->toIso8601String(),
                    'auto_renew' => $cert->auto_renew,
                    'created_at' => $cert->created_at?->toIso8601String(),
                    'user' => $cert->user ? [
                        'id' => $cert->user->id,
                        'name' => $cert->user->name,
                        'email' => $cert->user->email,
                    ] : null,
                ];
            });

        return response()->json(['certificates' => $certificates]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'is_admin' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => (bool) ($request->is_admin ?? false),
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'created_at' => $user->created_at?->toIso8601String(),
                'certificates_count' => 0,
            ],
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'is_admin' => 'boolean',
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('email')) {
            $user->email = $request->email;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        if (array_key_exists('is_admin', $request->all())) {
            $user->is_admin = (bool) $request->is_admin;
        }
        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'created_at' => $user->created_at?->toIso8601String(),
                'certificates_count' => $user->certificates()->count(),
            ],
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ((int) $user->id === (int) $request->user()->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own account.'],
            ]);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
