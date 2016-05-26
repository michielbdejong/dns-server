FROM node
COPY . /app
RUN cd /app && npm install
EXPOSE 53/udp 5300
CMD node /app/index.js /app/test/fixtures/certs 53 5300 box.knilxof.org
