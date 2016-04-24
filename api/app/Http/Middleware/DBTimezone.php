<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Database;

class DBTimezone {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
        return $next($request);
    }

}
