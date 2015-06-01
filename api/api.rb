# myapp.rb
require 'sinatra'

#get '/' do
#  'Hello world!'
#end

post '/temp:location' do
    'Set temp'
end

get '/temp:location' do
    'Get temp'
end
