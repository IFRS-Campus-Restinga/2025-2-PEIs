FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

COPY frontend.sh /frontend.sh
RUN chmod +x /frontend.sh

EXPOSE 5173

CMD ["/frontend.sh"]
