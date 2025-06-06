# Etapa 1: Build - compilar la app con Node.js
FROM node:20-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios
COPY package*.json ./
COPY . .

# Instala las dependencias y compila la app
RUN npm install
RUN npm run build

# Etapa 2: Producción - servir la app con un servidor web ligero
FROM nginx:alpine AS production

# Copia los archivos generados en la etapa anterior al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80 para acceder desde el navegador
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]



