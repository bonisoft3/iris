#!/bin/sh
set -e

curl -sf "http://crud:3000/grouphello?messages=like.*e2e*test*" | /bin/busybox grep -q ','
