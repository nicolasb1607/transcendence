#!/bin/bash

# Remove all unused volumes
cd .. && docker volume prune -f >/dev/null 2>&1

# Remove all unused networks
# docker network prune >/dev/null 2>&1

#Clean Shared volumes
rm -rf sources/database/data/

echo "Docker cleared of all images and containers."