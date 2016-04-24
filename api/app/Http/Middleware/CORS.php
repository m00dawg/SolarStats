<?php namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class CORS {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {

      header("Access-Control-Allow-Origin: *");
      header('Access-Control-Allow-Credentials: true');
      if ($request->isMethod("OPTIONS"))
      {
        // The client-side application can set only headers allowed in Access-Control-Allow-Headers
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, X-Auth-Token, Origin, Authorization');
        return (new Response('', 200));
      }
      return $next($request);
    }

}
