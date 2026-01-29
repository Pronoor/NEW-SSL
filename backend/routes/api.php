<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates', [CertificateController::class, 'store']);
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show']);
    Route::delete('/certificates/{certificate}', [CertificateController::class, 'destroy']);
    Route::post('/certificates/{certificate}/renew', [CertificateController::class, 'renew']);
    Route::post('/certificates/{certificate}/toggle-auto-renew', [CertificateController::class, 'toggleAutoRenew']);
    Route::get('/certificates/{certificate}/details', [CertificateController::class, 'details']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});
