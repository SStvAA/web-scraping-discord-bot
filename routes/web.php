<?php

use Illuminate\Support\Facades\Route;
use App\Http\Livewire\Monitor\Monitors;
use App\Http\Livewire\Proxy\Proxies;
use App\Http\Livewire\Account\Accounts;
use App\Http\Livewire\Discord\Discords;
use App\Http\Livewire\Telegram\Telegrams;
use App\Http\Livewire\Worker\Workers;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified'
])->group(function () {

    Route::get('/monitor', Monitors::class)->name('monitor');

    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    Route::get('/worker', Workers::class)->name('worker');

    Route::get('/discord', Discords::class )->name('discord');

    Route::get('/telegram', Telegrams::class )->name('telegram');

    Route::get('/proxy',  Proxies::class )->name('proxy');

    Route::get('/account', Accounts::class )->name('account');

});
