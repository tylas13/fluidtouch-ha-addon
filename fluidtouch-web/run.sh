#!/usr/bin/with-contenv bashio

# Get configuration
CONFIG_PATH=/data/options.json

# Export configuration as environment variables
export FLUIDNC_HOST=$(bashio::config 'fluidnc_host')
export FLUIDNC_PORT=$(bashio::config 'fluidnc_port')

# Log startup
bashio::log.info "Starting FluidTouch Web..."
bashio::log.info "FluidNC Host: ${FLUIDNC_HOST}"
bashio::log.info "FluidNC Port: ${FLUIDNC_PORT}"

# Create config directory if it doesn't exist
mkdir -p /data/config

# Start the Node.js application
cd /app
exec node server/index.js
