FROM node:17
ENV WORKDIR_APP /var/prod

WORKDIR ${WORKDIR_APP}
COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "npm run start:prod"]