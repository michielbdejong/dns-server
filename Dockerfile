FROM node
COPY server /app
COPY test/fixtures/certs /certs
RUN cd /app && npm install
EXPOSE 53/udp 5300
CMD node /app/index.js /certs 53 5300 box.knilxof.org
