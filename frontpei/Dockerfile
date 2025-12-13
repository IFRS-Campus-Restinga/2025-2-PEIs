FROM node:22

WORKDIR /app

COPY limpezaFront.sh /limpezaFront.sh
RUN chmod +x /limpezaFront.sh
RUN sh /limpezaFront.sh

COPY package.json package-lock.json ./
RUN npm install

COPY . .

COPY frontend.sh /frontend.sh
RUN chmod +x /frontend.sh

EXPOSE 5173

CMD ["sh", "/frontend.sh"]
 