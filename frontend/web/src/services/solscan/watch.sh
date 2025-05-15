#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Démarrage du serveur en mode watch...${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter le serveur${NC}\n"

last_modified=$(find . -name "*.js" | grep -v "node_modules" | xargs stat -f "%m" 2>/dev/null | sort -nr | head -1)

while true; do
  node web_api.js &
  server_pid=$!
  echo -e "\n${GREEN}Serveur démarré avec PID:${NC} $server_pid"
  
  while true; do
    sleep 2
    new_modified=$(find . -name "*.js" -o -name "*.json" | grep -v "node_modules" | xargs stat -f "%m" 2>/dev/null | sort -nr | head -1)
    
    if [ "$new_modified" != "$last_modified" ]; then
      echo -e "\n${YELLOW}Changements détectés, redémarrage du serveur...${NC}"
      kill -9 $server_pid 2>/dev/null
      echo -e "${RED}Serveur arrêté${NC}"
      last_modified=$new_modified
      break
    fi
  done
done
