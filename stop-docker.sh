#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}         DETENIENDO TRAMBOORY EN DOCKER          ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker no está instalado. No hay servicios que detener.${NC}"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose no está instalado. No hay servicios que detener.${NC}"
    exit 1
fi

# Preguntar qué acción desea realizar el usuario
echo -e "${YELLOW}¿Qué acción deseas realizar?${NC}"
echo -e "${GREEN}1)${NC} Detener los servicios temporalmente (puedes reiniciarlos después)"
echo -e "${GREEN}2)${NC} Detener y eliminar los contenedores (manteniendo los datos)"
echo -e "${GREEN}3)${NC} Detener, eliminar los contenedores y eliminar todos los datos"
echo -e "${RED}4)${NC} Cancelar y no hacer nada"

read -p "Selecciona una opción (1-4): " option

case $option in
    1)
        echo -e "${YELLOW}Deteniendo los servicios de Tramboory...${NC}"
        docker-compose stop
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}¡Los servicios se han detenido correctamente!${NC}"
            echo -e "${YELLOW}Puedes reiniciarlos con: docker-compose start${NC}"
        else
            echo -e "${RED}Hubo un problema al detener los servicios.${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${YELLOW}Deteniendo y eliminando los contenedores de Tramboory...${NC}"
        docker-compose down
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}¡Los contenedores se han eliminado correctamente!${NC}"
            echo -e "${YELLOW}Los datos persisten en los volúmenes. Puedes reiniciar todo con: ./start-docker.sh${NC}"
        else
            echo -e "${RED}Hubo un problema al eliminar los contenedores.${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${RED}¡ADVERTENCIA! Esta acción eliminará TODOS los datos de la base de datos.${NC}"
        read -p "¿Estás seguro? (s/n): " confirm
        
        if [[ $confirm == "s" || $confirm == "S" ]]; then
            echo -e "${YELLOW}Deteniendo, eliminando los contenedores y volúmenes de Tramboory...${NC}"
            docker-compose down -v
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}¡Los contenedores y volúmenes se han eliminado correctamente!${NC}"
                echo -e "${YELLOW}Todos los datos han sido eliminados. Puedes reiniciar todo con: ./start-docker.sh${NC}"
            else
                echo -e "${RED}Hubo un problema al eliminar los contenedores y volúmenes.${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}Operación cancelada.${NC}"
            exit 0
        fi
        ;;
    4)
        echo -e "${YELLOW}Operación cancelada. Los servicios siguen ejecutándose.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Opción no válida.${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${YELLOW}¡Gracias por usar Tramboory!${NC}"
echo -e "${BLUE}==================================================${NC}"