#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}         INICIANDO TRAMBOORY CON DOCKER          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker no está instalado. Por favor, instálalo primero.${NC}"
    echo -e "${YELLOW}Visita: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose no está instalado. Por favor, instálalo primero.${NC}"
    echo -e "${YELLOW}Visita: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${YELLOW}Iniciando los servicios de Tramboory...${NC}"

# Iniciar los servicios con Docker Compose en segundo plano
docker-compose up -d

# Verificar si los servicios se iniciaron correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Los servicios se han iniciado correctamente!${NC}"
    
    echo -e "\n${BLUE}==================================================${NC}"
    echo -e "${BLUE}                ACCESO A SERVICIOS                ${NC}"
    echo -e "${BLUE}==================================================${NC}"
    
    echo -e "${GREEN}Frontend:${NC} http://localhost:80"
    echo -e "${GREEN}Backend API:${NC} http://localhost:3001/api"
    
    echo -e "\n${BLUE}==================================================${NC}"
    echo -e "${BLUE}           CREDENCIALES DE BASE DE DATOS          ${NC}"
    echo -e "${BLUE}==================================================${NC}"
    
    echo -e "${GREEN}Host:${NC} localhost"
    echo -e "${GREEN}Puerto:${NC} 5432"
    echo -e "${GREEN}Usuario:${NC} postgres"
    echo -e "${GREEN}Contraseña:${NC} postgres"
    echo -e "${GREEN}Base de datos:${NC} tramboory"
    echo -e "${GREEN}Schemas:${NC} main, inventory"
    
    echo -e "\n${YELLOW}Estas credenciales pueden ser utilizadas en DataGrip o cualquier otro cliente PostgreSQL.${NC}"
    
    echo -e "\n${BLUE}==================================================${NC}"
    echo -e "${BLUE}                 COMANDOS ÚTILES                  ${NC}"
    echo -e "${BLUE}==================================================${NC}"
    
    echo -e "${GREEN}Ver logs:${NC} docker-compose logs -f"
    echo -e "${GREEN}Detener servicios:${NC} docker-compose stop"
    echo -e "${GREEN}Reiniciar servicios:${NC} docker-compose restart"
    echo -e "${GREEN}Eliminar contenedores:${NC} docker-compose down"
    
    echo -e "\n${YELLOW}Para más información, consulta el archivo README.md${NC}"
else
    echo -e "${RED}Hubo un problema al iniciar los servicios. Por favor, revisa los logs.${NC}"
    echo -e "${YELLOW}Ejecuta: docker-compose logs${NC}"
    exit 1
fi