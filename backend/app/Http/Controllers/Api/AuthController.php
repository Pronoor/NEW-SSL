<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const OTP_TTL_SECONDS = 600; // 10 minutes
    private const OTP_LENGTH = 6;

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'captcha_id' => 'required|string|size:32',
            'captcha_answer' => 'required|string|max:10',
        ]);

        $cacheKey = 'captcha_' . $request->captcha_id;
        $expectedAnswer = Cache::get($cacheKey);

        if ($expectedAnswer === null) {
            throw ValidationException::withMessages([
                'captcha' => ['Captcha expired or invalid. Please refresh and try again.'],
            ]);
        }

        if ((string) trim($request->captcha_answer) !== (string) $expectedAnswer) {
            Cache::forget($cacheKey);
            throw ValidationException::withMessages([
                'captcha' => ['Wrong answer. Please solve the math question correctly.'],
            ]);
        }

        Cache::forget($cacheKey);

        $otp = (string) random_int(10 ** (self::OTP_LENGTH - 1), 10 ** self::OTP_LENGTH - 1);
        $registrationKey = 'registration_otp:' . strtolower($request->email);
        Cache::put($registrationKey, [
            'name' => $request->name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'otp_hash' => Hash::make($otp),
        ], self::OTP_TTL_SECONDS);

        Mail::to($request->email)->send(new OtpVerificationMail($otp, $request->email));

        return response()->json([
            'message' => 'OTP sent to your email. Please verify to complete registration.',
            'email' => $request->email,
            'requires_verification' => true,
        ], 200);
    }

    public function registerVerify(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
            'otp' => 'required|string|size:6|regex:/^[0-9]+$/',
        ]);

        $registrationKey = 'registration_otp:' . strtolower($request->email);
        $data = Cache::get($registrationKey);

        if ($data === null) {
            throw ValidationException::withMessages([
                'otp' => ['OTP expired or invalid. Please request a new code.'],
            ]);
        }

        if (!Hash::check($request->otp, $data['otp_hash'])) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP. Please check and try again.'],
            ]);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password_hash'],
        ]);

        Cache::forget($registrationKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified. Registration complete.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function registerResendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        $registrationKey = 'registration_otp:' . strtolower($request->email);
        $data = Cache::get($registrationKey);

        if ($data === null) {
            throw ValidationException::withMessages([
                'email' => ['No pending registration for this email or OTP expired. Please register again.'],
            ]);
        }

        $otp = (string) random_int(10 ** (self::OTP_LENGTH - 1), 10 ** self::OTP_LENGTH - 1);
        $data['otp_hash'] = Hash::make($otp);
        Cache::put($registrationKey, $data, self::OTP_TTL_SECONDS);

        Mail::to($request->email)->send(new OtpVerificationMail($otp, $request->email));

        return response()->json([
            'message' => 'A new OTP has been sent to your email.',
            'email' => $request->email,
        ], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
