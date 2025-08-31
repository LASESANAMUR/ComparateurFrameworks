# Étape de base : utiliser nginx
FROM nginx:alpine

# Supprimer les fichiers par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier ton code dans le dossier web de nginx
COPY . /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80