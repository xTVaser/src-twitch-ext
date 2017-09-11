#!/bin/bash

openssl genrsa -out server.key 2048

echo "Generated Key File..."

openssl req -new -key server.key -out server.csr

echo "Generated CSR File..."

openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

echo "Generated Certificate..."
echo "Generation Complete, this will not be a trusted certificate, Twitch required a trusted SSL certificate so a good option is to use ngrok, however everytime you start up ngrok you will be given a new URL unless you upgrade from free tier, the other option is to get your own domain and get a certificate with Let's Encrypt"
