# myapp.rb
require 'sinatra'
require 'dalli'

options = { :namespace => "SolarStats", :compress => true, :expires_in => 300}
dc = Dalli::Client.new('localhost:11211', options)

patch '/temp/:location' do
    dc.set("temp:#{params['location']}", request.body.read)
end

get '/temp/:location' do
    value = dc.get("temp:#{params['location']}")
    return value
end
