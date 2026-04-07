#!/bin/sh
set -e

# Verify Garage bucket exists and imgproxy is healthy
wget -q --spider http://imgproxy:8081/health
