
FROM node:20-alpine as base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

FROM base as build

COPY . .

RUN npm run build

FROM base as prod

ENV PORT=3000

COPY --from=build /app/dist ./dist

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

RUN npm i --only=production

EXPOSE 3000

CMD ["npm", "run", "start"]
