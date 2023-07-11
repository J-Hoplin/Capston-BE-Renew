FROM node:20.1.0-bullseye

LABEL maintainer="Hoplin"

COPY . .
RUN yarn install

EXPOSE 3000

CMD ["start:dev"]
ENTRYPOINT ["yarn","run"]