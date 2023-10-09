FROM node:20-alpine3.17

WORKDIR /usr/src/app

# Copy frontend files
COPY ./frontend /usr/src/app/frontend

# Copy NestJS source files
COPY ./backend/source ./

# Copy entrypoint
COPY ./backend/entrypoint.sh ./

# Install PNPM & chmod entrypoint
RUN	apk add curl && \
	apk add openssl && \
	curl -s --compressed https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh - && \
	chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]
#CMD ["tail", "-f", "/dev/null"]
