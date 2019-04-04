FROM node:7
WORKDIR /opt/app
COPY package.json package-lock.json* ./
RUN npm install
COPY . /opt/app
EXPOSE 3000
CMD ["npm","run","start"]