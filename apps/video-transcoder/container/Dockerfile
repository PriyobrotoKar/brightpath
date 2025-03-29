FROM ubuntu:focal

RUN /usr/bin/apt-get update && \
	/usr/bin/apt-get install -y curl && \
	curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
	/usr/bin/apt-get update && \
	/usr/bin/apt-get upgrade -y && \
	/usr/bin/apt-get install -y nodejs ffmpeg


WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm install

COPY index.ts .

RUN npm run build

WORKDIR /app/output

ENV INPUT_VIDEO=/app/sample.mp4

ENTRYPOINT ["node", "/app/dist/index.js"]
