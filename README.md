# API boilerplate

Boilerplate pessoal para APIs REST pequenas com Node.js, Express 5 e MySQL local.

## Pré-requisitos

- Node.js 20.6 ou mais recente (os scripts usam `--env-file`).
- MySQL 8+ local.

## Instalação

```bash
npm install
cp .env.example .env
```

Edite `.env` com o usuário, senha e banco locais. O arquivo `.env` não é versionado.

## Banco de dados

Crie o banco e execute a migration manualmente. A API não cria nem altera tabelas ao iniciar:

```bash
mysql -u root -p -e "CREATE DATABASE api_boilerplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u api_user -p api_boilerplate < database/migrations/001_create_tasks.sql
```

Configure `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` no `.env`.

## Executar e testar

```bash
npm run dev       # desenvolvimento com nodemon
npm start         # execução normal
npm test          # testes independentes de MySQL
```

Os testes de integração são opt-in e exigem um banco separado. Configure `TEST_DB_NAME` diferente de `DB_NAME` e execute `RUN_INTEGRATION_TESTS=1 npm run test:integration`. Não use um banco com dados pessoais.

## Endpoints

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Estudar Express"}'

curl http://localhost:3000/tasks
curl http://localhost:3000/tasks/1

curl -X PATCH http://localhost:3000/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}'

curl -X DELETE http://localhost:3000/tasks/1
```

`POST` retorna `201`, consultas e atualizações retornam `200`, exclusões retornam `204`, entradas inválidas retornam `400`, recursos/rotas inexistentes retornam `404` e falhas inesperadas retornam `500` com mensagem genérica.

## Camadas

O fluxo é `Routes → Controllers → Services → Repositories → MySQL`.

- Routes conectam endpoints, validações e controllers.
- Controllers traduzem HTTP para chamadas de service.
- Services aplicam as regras de existência das tarefas.
- Repositories concentram SQL parametrizado e não conhecem HTTP.
- Middlewares validam entradas, tratam rotas ausentes e formatam erros.

Para adicionar outro recurso, crie um repository com SQL parametrizado, um service com regras de negócio, um controller com respostas HTTP, validações específicas e um router; registre o router em `src/app.js` e adicione a migration/documentação correspondente.
