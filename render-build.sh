#!/bin/bash

# Install dependencies
npm ci

# Build the application
npm run build

# Copy _headers file to dist directory
cp public/_headers dist/_headers