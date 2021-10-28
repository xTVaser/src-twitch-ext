FROM node:8.4.0

MAINTAINER Twitch Interactive, Inc.

# Install the npm packages which change infrequently
WORKDIR /boilerplate/backend
COPY ./package.json ./
RUN npm install supervisor -g
RUN npm install

EXPOSE 443
CMD ["./entrypoint.sh"]
