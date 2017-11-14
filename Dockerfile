# Dockerfile.alpine
FROM node:alpine

# Create app dir
RUN mkdir -p /app
RUN mkdir -p /app/logs
WORKDIR /app
COPY package.json /app

RUN apk add --no-cache make gcc g++ python && npm install cnpm -g --registry=https://registry.npm.taobao.org \
  && cnpm install && apk del make gcc g++ python && npm uninstall cnpm -g

# Bundle app source
COPY . /app

# Expose port
EXPOSE 6086

CMD ["npm", "start"]