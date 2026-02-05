<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CaptchaController extends Controller
{
    /** TTL in seconds (5 minutes) */
    private const CAPTCHA_TTL = 300;

    /**
     * Generate a new math CAPTCHA.
     * Returns captcha_id and question. Answer is stored in cache for verification.
     */
    public function show(Request $request)
    {
        $num1 = random_int(1, 15);
        $num2 = random_int(1, 15);
        $answer = $num1 + $num2;
        $id = Str::random(32);

        Cache::put('captcha_' . $id, (string) $answer, self::CAPTCHA_TTL);

        return response()->json([
            'captcha_id' => $id,
            'question' => "What is {$num1} + {$num2}?",
        ]);
    }
}
