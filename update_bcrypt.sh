#!/bin/bash

# Desinstalar bcrypt
echo "Desinstalando bcrypt..."
npm uninstall bcrypt

# Instalar bcryptjs
echo "Instalando bcryptjs..."
npm install bcryptjs

# Reemplazar todas las instancias de 'bcrypt' con 'bcryptjs' en los archivos del proyecto
echo "Actualizando archivos para usar bcryptjs en lugar de bcrypt..."
grep -rl "require('bcrypt')" app/ | xargs sed -i '' "s/require('bcrypt')/require('bcryptjs')/g"
grep -rl 'require("bcrypt")' app/ | xargs sed -i '' 's/require("bcrypt")/require("bcryptjs")/g'

echo "Proceso completado. bcrypt ha sido reemplazado por bcryptjs en el proyecto."
