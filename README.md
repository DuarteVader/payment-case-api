# Payment API

API REST para gerenciamento do ciclo de vida de cobranças, com suporte a **PIX** e **Cartão de Crédito**.

A aplicação foi desenvolvida utilizando **NestJS**, **TypeScript**, **PostgreSQL**, **TypeORM** e integração com o **Mercado Pago**.

O projeto segue princípios de **Clean Architecture**, separando regras de negócio, casos de uso, infraestrutura e camada HTTP.

---

## Tecnologias

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- TypeORM
- Mercado Pago SDK
- class-validator
- class-transformer
- Swagger / OpenAPI
- Jest
- Docker Compose
- ngrok para testes locais de webhook

---

## Funcionalidades

A API possui os seguintes endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/payment` | Cria um novo pagamento |
| PUT | `/api/payment/:id` | Atualiza um pagamento |
| GET | `/api/payment/:id` | Busca um pagamento pelo ID |
| GET | `/api/payment` | Lista pagamentos |
| POST | `/api/payment/webhook` | Recebe notificações do Mercado Pago |

A listagem de pagamentos permite filtros por:

- CPF
- Meio de pagamento

Exemplos:

```http
GET /api/payment?cpf=11144477735
```

```http
GET /api/payment?paymentMethod=PIX
```

---

## Meios de pagamento

A aplicação suporta:

```text
PIX
CREDIT_CARD
```

Os possíveis status são:

```text
PENDING
PAID
FAIL
```

---

# Fluxo PIX

Pagamentos PIX são registrados no banco de dados com status inicial:

```text
PENDING
```

Nenhuma integração externa é realizada nessa etapa.

Fluxo:

```text
POST /api/payment
        ↓
paymentMethod = PIX
        ↓
criação do pagamento
        ↓
PostgreSQL
        ↓
status = PENDING
```

---

# Fluxo Cartão de Crédito

Pagamentos utilizando:

```text
CREDIT_CARD
```

também são criados inicialmente como:

```text
PENDING
```

Após salvar o pagamento, a aplicação cria uma **Preference do Checkout Pro** no Mercado Pago.

Fluxo:

```text
POST /api/payment
        ↓
criação do pagamento
        ↓
status = PENDING
        ↓
PostgreSQL
        ↓
Mercado Pago
        ↓
criação da Preference
        ↓
checkoutUrl
        ↓
cliente realiza o pagamento
        ↓
Mercado Pago envia webhook
        ↓
API consulta o pagamento no Mercado Pago
        ↓
PAID / FAIL
```

O identificador do pagamento criado pela nossa aplicação é enviado ao Mercado Pago utilizando:

```text
external_reference
```

Dessa forma, quando recebemos uma notificação, conseguimos relacionar o pagamento do Mercado Pago ao registro salvo no banco local.

---

# Atualização do status do pagamento

Quando o Mercado Pago envia uma notificação para:

```text
POST /api/payment/webhook
```

a aplicação recebe o identificador do pagamento externo no campo:

```text
data.id
```

A API não utiliza apenas o conteúdo recebido no webhook para decidir o status.

Ela consulta o pagamento diretamente no Mercado Pago:

```text
Webhook
   ↓
data.id
   ↓
MercadoPagoGateway
   ↓
Mercado Pago API
   ↓
status do pagamento
   ↓
external_reference
   ↓
busca pagamento local
   ↓
atualiza status
```

O mapeamento utilizado é:

| Status Mercado Pago | Status local |
|---|---|
| `approved` | `PAID` |
| `rejected` | `FAIL` |
| `cancelled` | `FAIL` |
| demais status | permanece `PENDING` |

---

# Arquitetura

O projeto foi organizado seguindo princípios de **Clean Architecture**.

A estrutura principal é:

```text
src/
│
├── domain/
│   └── payment/
│
├── application/
│   └── payment/
│
├── infrastructure/
│   ├── database/
│   └── integrations/
│
└── presentation/
    └── http/
```

A ideia é separar as regras da aplicação das tecnologias externas utilizadas.

---

## Domain

A camada:

```text
domain
```

contém as regras e modelos principais relacionados ao pagamento.

Ela não depende diretamente de:

```text
HTTP
NestJS Controller
PostgreSQL
TypeORM
Mercado Pago
```

Principais componentes:

```text
Payment
PaymentMethod
PaymentStatus
PaymentRepository
CPF Validator
```

A entidade:

```text
Payment
```

representa o pagamento dentro da aplicação.

---

## Application

A camada:

```text
application
```

contém os casos de uso.

Foram implementados:

```text
CreatePaymentUseCase

GetPaymentUseCase

ListPaymentsUseCase

UpdatePaymentUseCase

ProcessPaymentWebhookUseCase
```

Essa camada também possui a abstração:

```text
PaymentGateway
```

Ela permite que os casos de uso interajam com um serviço externo de pagamento sem depender diretamente do SDK do Mercado Pago.

---

## Infrastructure

A camada:

```text
infrastructure
```

contém as implementações relacionadas a serviços externos.

Entre elas:

```text
TypeORM

PostgreSQL

Migrations

MercadoPagoGateway
```

O:

```text
TypeOrmPaymentRepository
```

é responsável pela implementação do:

```text
PaymentRepository
```

E o:

```text
MercadoPagoGateway
```

implementa:

```text
PaymentGateway
```

para comunicação com o Mercado Pago.

---

## Presentation

A camada:

```text
presentation
```

contém a entrada HTTP da aplicação.

Principais componentes:

```text
PaymentController

CreatePaymentDto

UpdatePaymentDto

ListPaymentsQueryDto

PaymentWebhookDto
```

O fluxo principal fica:

```text
HTTP Request
     ↓
Controller
     ↓
Use Case
     ↓
Repository / PaymentGateway
     ↓
PostgreSQL / Mercado Pago
```

---

# Estrutura do pagamento

Um pagamento possui:

```text
id
cpf
description
amount
paymentMethod
status
externalId
checkoutUrl
createdAt
updatedAt
```

Onde:

### id

Identificador único do pagamento dentro da aplicação.

### cpf

CPF relacionado ao pagamento.

### description

Descrição da cobrança.

### amount

Valor da cobrança.

### paymentMethod

Pode ser:

```text
PIX
CREDIT_CARD
```

### status

Pode ser:

```text
PENDING
PAID
FAIL
```

### externalId

Identificador externo utilizado na integração com o Mercado Pago.

No fluxo atual de Checkout Pro, esse campo armazena o identificador da Preference criada no Mercado Pago.

### checkoutUrl

URL utilizada para realizar o pagamento pelo Checkout Pro.

---

# Validações

A aplicação utiliza:

```text
class-validator
```

para validação dos dados recebidos pela API.

Entre as validações implementadas estão:

- CPF obrigatório;
- validação do CPF;
- valor do pagamento maior que zero;
- valor com no máximo duas casas decimais;
- método de pagamento válido;
- status válido;
- validação do payload recebido pelo webhook.

Também existe uma validação própria para CPF na camada de domínio.

---

# Configuração

## Pré-requisitos

Para executar o projeto é necessário possuir:

```text
Node.js
npm
Docker
Docker Compose
```

---

## Instalação

Instale as dependências:

```bash
npm install
```

---

# Variáveis de ambiente

Crie um arquivo:

```text
.env
```

na raiz do projeto.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=payments_user
DB_PASSWORD=payments_password
DB_DATABASE=payments

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_URL=
```

O:

```text
MERCADO_PAGO_ACCESS_TOKEN
```

deve possuir um Access Token válido do Mercado Pago.

O:

```text
MERCADO_PAGO_WEBHOOK_URL
```

deve apontar para o endpoint público do webhook.

Exemplo:

```text
https://example.ngrok-free.app/api/payment/webhook
```

> O arquivo `.env` não deve ser versionado.

---

# Banco de dados

O PostgreSQL pode ser iniciado através do Docker Compose:

```bash
docker compose up -d
```

Para verificar os containers:

```bash
docker compose ps
```

---

# Migrations

A aplicação utiliza migrations do TypeORM.

O projeto está configurado com:

```text
synchronize: false
```

Portanto, a estrutura do banco deve ser criada através das migrations.

Executar migrations:

```bash
npm run migration:run
```

Reverter a última migration:

```bash
npm run migration:revert
```

---

# Executando a aplicação

Após configurar o banco e as variáveis de ambiente:

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

---

# Swagger

A documentação da API está disponível através do Swagger.

Após iniciar a aplicação, acesse:

```text
http://localhost:3000/docs
```

Através do Swagger é possível visualizar e testar os endpoints disponíveis.

---

# Exemplos

## Criar pagamento PIX

Endpoint:

```http
POST /api/payment
```

Body:

```json
{
  "cpf": "11144477735",
  "description": "Pagamento PIX",
  "amount": 100,
  "paymentMethod": "PIX"
}
```

O pagamento será criado com:

```json
{
  "paymentMethod": "PIX",
  "status": "PENDING",
  "externalId": null,
  "checkoutUrl": null
}
```

---

## Criar pagamento com cartão

Endpoint:

```http
POST /api/payment
```

Body:

```json
{
  "cpf": "11144477735",
  "description": "Pagamento teste cartão",
  "amount": 199.9,
  "paymentMethod": "CREDIT_CARD"
}
```

A aplicação irá:

```text
criar pagamento local
        ↓
salvar PENDING
        ↓
criar Preference no Mercado Pago
        ↓
retornar checkoutUrl
```

Exemplo de resposta:

```json
{
  "id": "1df8cbd9-c633-4b22-90e0-8bab73e4a32e",
  "cpf": "11144477735",
  "description": "Pagamento teste cartão",
  "amount": 199.9,
  "paymentMethod": "CREDIT_CARD",
  "status": "PENDING",
  "externalId": "preference-id",
  "checkoutUrl": "https://..."
}
```

O usuário pode acessar:

```text
checkoutUrl
```

para realizar o pagamento.

---

## Buscar pagamento pelo ID

```http
GET /api/payment/:id
```

Exemplo:

```text
GET /api/payment/1df8cbd9-c633-4b22-90e0-8bab73e4a32e
```

---

## Listar pagamentos

```http
GET /api/payment
```

---

## Filtrar por CPF

```http
GET /api/payment?cpf=11144477735
```

---

## Filtrar por meio de pagamento

```http
GET /api/payment?paymentMethod=CREDIT_CARD
```

---

## Atualizar pagamento

```http
PUT /api/payment/:id
```

Exemplo:

```json
{
  "description": "Descrição atualizada"
}
```

Também é possível atualizar o status através deste endpoint.

---

# Webhook do Mercado Pago

O endpoint utilizado para notificações é:

```text
POST /api/payment/webhook
```

Durante o desenvolvimento local, pode ser necessário disponibilizar a API na internet para que o Mercado Pago consiga realizar a chamada.

Uma opção é utilizar:

```text
ngrok
```

Exemplo:

```bash
ngrok http 3000
```

O ngrok irá gerar uma URL pública semelhante a:

```text
https://xxxxx.ngrok-free.app
```

Configure:

```env
MERCADO_PAGO_WEBHOOK_URL=https://xxxxx.ngrok-free.app/api/payment/webhook
```

Depois reinicie a aplicação.

---

## Fluxo do webhook

Exemplo de evento:

```json
{
  "type": "payment",
  "data": {
    "id": "181031463227"
  }
}
```

O:

```text
data.id
```

é o Payment ID do Mercado Pago.

A aplicação consulta:

```text
GET /v1/payments/{id}
```

através do SDK do Mercado Pago.

Um pagamento aprovado pode retornar:

```json
{
  "id": 181031463227,
  "status": "approved",
  "external_reference": "1df8cbd9-c633-4b22-90e0-8bab73e4a32e"
}
```

Nesse caso:

```text
approved
    ↓
PAID
```

Um pagamento rejeitado pode retornar:

```json
{
  "status": "rejected",
  "status_detail": "cc_rejected_other_reason"
}
```

Nesse caso:

```text
rejected
    ↓
FAIL
```

---

# Testes unitários

Os testes foram desenvolvidos utilizando:

```text
Jest
```

Os principais cenários testados são:

```text
PIX criado com status PENDING

PIX não realiza chamada ao Mercado Pago

CREDIT_CARD realiza criação do checkout

CPF inválido é rejeitado

Webhook approved altera pagamento para PAID

Webhook rejected altera pagamento para FAIL

Eventos diferentes de payment são ignorados

Validação de CPF
```

Para executar todos os testes:

```bash
npm test
```

Para executar um teste específico:

```bash
npm test -- create-payment.use-case.spec.ts
```

Para executar em modo watch:

```bash
npm run test:watch
```

Para gerar cobertura:

```bash
npm run test:cov
```

---

# Testes de integração com Mercado Pago

Durante o desenvolvimento, o fluxo de cartão foi testado utilizando contas de teste do Mercado Pago.

O cenário validado foi:

```text
API cria Preference
        ↓
Checkout Pro
        ↓
pagamento realizado
        ↓
Mercado Pago gera Payment
        ↓
Webhook
        ↓
API consulta Mercado Pago
        ↓
approved → PAID
```

Também foi validado um cenário de rejeição:

```text
rejected → FAIL
```

---

# Decisões técnicas

## Clean Architecture

A aplicação foi dividida em camadas para evitar acoplamento entre regras de negócio e tecnologias externas.

Por exemplo:

```text
CreatePaymentUseCase
```

não depende diretamente do TypeORM.

Ele utiliza:

```text
PaymentRepository
```

Da mesma forma, os casos de uso não dependem diretamente do SDK do Mercado Pago.

Eles utilizam:

```text
PaymentGateway
```

As implementações concretas ficam na camada:

```text
infrastructure
```

Isso também facilita a criação de testes unitários, já que Repository e Gateway podem ser substituídos por mocks.

---

## Mercado Pago

Para pagamentos com cartão foi utilizado o:

```text
Checkout Pro
```

através da criação de Preferences.

O identificador interno do pagamento é enviado ao Mercado Pago utilizando:

```text
external_reference
```

Isso permite relacionar a transação do Mercado Pago ao registro local.

---

## Webhook

Ao receber um webhook, a aplicação não confia apenas no status enviado na requisição.

O Payment ID recebido é utilizado para consultar diretamente a API do Mercado Pago.

Dessa forma:

```text
Webhook
   ↓
Payment ID
   ↓
Mercado Pago API
   ↓
status real
   ↓
atualização local
```

---

## Temporal.io

O uso de Temporal.io era opcional.

Ele não foi utilizado nesta implementação para manter a solução mais objetiva e focada nos requisitos principais.

Em uma aplicação com maior complexidade, Temporal poderia ser utilizado para orquestrar o ciclo do pagamento e permitir retomada dos processos após falhas.

---

# Melhorias futuras

Algumas melhorias que poderiam ser adicionadas em uma evolução do projeto:

- validação da assinatura `x-signature` dos webhooks;
- autenticação e autorização;
- paginação na listagem;
- logs estruturados;
- métricas;
- observabilidade;
- testes E2E;
- maior cobertura de testes;
- tratamento mais detalhado dos estados do Mercado Pago;
- retry para falhas temporárias em integrações;
- uso de Temporal.io para orquestração.

---

# Considerações finais

A implementação foi construída priorizando:

```text
separação de responsabilidades

validação de dados

testabilidade

baixo acoplamento

isolamento das integrações externas
```

O fluxo PIX possui comportamento simples, registrando a cobrança como `PENDING`.

O fluxo de cartão utiliza o Mercado Pago para criar o checkout e recebe atualizações através de webhook, permitindo alterar o pagamento para:

```text
PAID
```

ou:

```text
FAIL
```

de acordo com o resultado da transação.