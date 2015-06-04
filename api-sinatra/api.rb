# myapp.rb
require 'sinatra'
require 'dalli'
require 'sequel'

options = { :namespace => "SolarStats", :compress => true, :expires_in => 300}
dc = Dalli::Client.new('localhost:11211', options)
db = Sequel.connect('mysql://solarweb:kyBJ3aYo8gpbZKjjUnDMnYgB@localhost/solar') 

patch '/temp/:location' do
    dc.set("temp:#{params['location']}", request.body.read)
end

get '/temp/:location' do
    value = dc.get("temp:#{params['location']}")
    return value
end

get '/api/v1/daily' do
    db['select * from items'].each do |row|
    p row
    end
end
