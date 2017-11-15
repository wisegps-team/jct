# Dockerfile.alpine
FROM node:alpine

# Create app dir
RUN mkdir -p /app
RUN mkdir -p /app/logs
WORKDIR /app
COPY package.json /app

RUN apk add --update \
	openssh \
    && rm -rf /var/cache/apk/*

RUN apk add --no-cache openssh-sftp-server openssh-client dropbear &&\
 apk add --no-cache make gcc g++ python &&\
 npm install cnpm -g --registry=https://registry.npm.taobao.org &&\
 cnpm install &&\
 apk del make gcc g++ python &&\
 npm uninstall cnpm -g &&\
 echo "root:root" | chpasswd &&\
 rm -rf /var/cache/apk/* /tmp/*

# Bundle app source
COPY . /app
RUN mkdir /etc/dropbear
RUN touch /var/log/lastlog
RUN chmod +x start.sh

# Expose port
EXPOSE 6086
EXPOSE 22

ENV NODE_ENV product

CMD ["npm", "start"]