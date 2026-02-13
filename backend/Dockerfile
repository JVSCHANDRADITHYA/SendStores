# FROM node:20-alpine

# RUN apk add --no-cache curl bash openssl

# RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# WORKDIR /app

# COPY backend/package*.json ./
# RUN npm install --production

# COPY backend/. .
# COPY helm /helm

# EXPOSE 4000
# CMD ["node", "server.js"]


FROM node:20-alpine

RUN apk add --no-cache curl bash ca-certificates openssl

# install kubectl
RUN curl -LO https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl \
 && chmod +x kubectl \
 && mv kubectl /usr/local/bin/kubectl

# install helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/. .
COPY helm /helm

EXPOSE 4000
CMD ["node", "server.js"]
