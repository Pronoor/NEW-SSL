<?php

use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/', function () {
    return response()->json(['status' => 'ok', 'message' => 'SSL Certificate Manager API']);
});
