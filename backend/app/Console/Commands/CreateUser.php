<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateUser extends Command
{
    protected $signature = 'user:create 
                            {--name= : User name}
                            {--email= : User email}
                            {--password= : User password}';

    protected $description = 'Create a new user';

    public function handle()
    {
        $name = $this->option('name') ?: $this->ask('Enter user name');
        $email = $this->option('email') ?: $this->ask('Enter user email');
        $password = $this->option('password') ?: $this->secret('Enter user password');

        // Validate input
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error('  - ' . $error);
            }
            return 1;
        }

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        $this->info("User created successfully!");
        $this->table(
            ['ID', 'Name', 'Email', 'Created At'],
            [[$user->id, $user->name, $user->email, $user->created_at]]
        );

        return 0;
    }
}
