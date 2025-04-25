FROM scratch AS sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS sources
WORKDIR /monorepo/./
COPY ./. .

FROM sources AS debug
WORKDIR /monorepo/
