# Tramboory

Sistema de gestión para reservas, inventario y finanzas.

## Configuración con Docker

Este proyecto está configurado para ejecutarse fácilmente utilizando Docker y Docker Compose, lo que permite un despliegue rápido y consistente en cualquier entorno.

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Servicios incluidos

1. **PostgreSQL** - Base de datos principal
2. **Backend** - API REST desarrollada en Node.js
3. **Frontend** - Aplicación web desarrollada en React

### Iniciar el proyecto

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd tramboory
```

2. Inicia los servicios con Docker Compose:

```bash
docker-compose up -d
```

Esto iniciará todos los servicios en segundo plano. La primera vez que ejecutes este comando, Docker descargará las imágenes necesarias y construirá los contenedores, lo que puede tomar unos minutos.

3. Para ver los logs de los servicios:

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Acceder a los servicios

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001/api
- **Base de datos PostgreSQL**: 
  - Host: localhost
  - Puerto: 5432
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: tramboory

### Conexión a la base de datos

Para conectarte a la base de datos usando un cliente PostgreSQL como pgAdmin o DBeaver, usa las siguientes credenciales:

- Host: localhost
- Puerto: 5432
- Usuario: postgres
- Contraseña: postgres
- Base de datos: tramboory

La base de datos está configurada con dos schemas:
- `main`: Contiene las tablas principales del sistema (usuarios, reservas, pagos, etc.)
- `inventory`: Contiene las tablas relacionadas con el inventario (materias primas, proveedores, etc.)

### Detener los servicios

Para detener los servicios sin eliminar los contenedores:

```bash
docker-compose stop
```

Para detener y eliminar los contenedores, pero mantener los volúmenes de datos:

```bash
docker-compose down
```

Para detener, eliminar los contenedores y también eliminar los volúmenes de datos:

```bash
docker-compose down -v
```

### Reconstruir los servicios

Si realizas cambios en el código fuente y necesitas reconstruir los contenedores:

```bash
docker-compose build
docker-compose up -d
```

### Persistencia de datos

Los datos de la base de datos PostgreSQL se almacenan en un volumen llamado `tramboory_postgres_data`, lo que garantiza que los datos persistan incluso si los contenedores se detienen o eliminan.

### Solución de problemas comunes

1. **El frontend no puede conectarse al backend**:
   - Verifica que el backend esté funcionando correctamente con `docker-compose logs backend`
   - Asegúrate de que la variable de entorno `VITE_API_URL` en `client/.env.docker` apunte a la URL correcta

2. **Errores de conexión a la base de datos**:
   - Verifica que el servicio de PostgreSQL esté funcionando con `docker-compose logs postgres`
   - Asegúrate de que las credenciales de la base de datos en `app/.env.docker` sean correctas

3. **Cambios en el código no se reflejan**:
   - Reconstruye los contenedores con `docker-compose build` seguido de `docker-compose up -d`

4. **Errores al iniciar los servicios**:
   - Verifica los logs con `docker-compose logs`
   - Asegúrate de que los puertos necesarios (80, 3001, 5432) no estén siendo utilizados por otras aplicaciones

### Información adicional

Las variables de entorno utilizadas en este proyecto están configuradas en:

- `app/.env.docker` para el backend
- `client/.env.docker` para el frontend
- Directamente en el archivo `docker-compose.yml`

Si necesitas personalizar alguna configuración, puedes modificar estos archivos según tus necesidades.