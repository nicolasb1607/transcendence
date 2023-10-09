FROM postgres:15.2

ADD ./db.sql /docker-entrypoint-initdb.d/
ADD ./mockData.sql /docker-entrypoint-initdb.d/

RUN chmod -R 700 /var/lib/postgresql/data \
	&& chown -R postgres:postgres /var/lib/postgresql/data