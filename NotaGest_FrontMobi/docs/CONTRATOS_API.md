# Contratos de API e DTOs — NotaGest Mobile & Backend

Este documento formaliza os contratos entre o cliente mobile (`NotaGest_FrontMobi`) e o servidor (`NotaGest_Backend`). Cada contrato possui um esquema Zod de validação de borda, garantindo que nenhum dado corrompido seja consumido pelas telas.

---

## 0. Endpoints Base e Ambientes de Execução

A resolução da URL base da API é controlada centralizadamente pela chave `EXPO_PUBLIC_APP_ENV` no arquivo `.env`:

| Perfil (`EXPO_PUBLIC_APP_ENV`) | Base URL | Descrição e Uso |
| :--- | :--- | :--- |
| **`dev`** | `http://localhost:5000` (Web) / `http://10.0.2.2:5000` (Emulador) | Execução local com Docker e testes isolados |
| **`prod`** | `https://api.notagest.com.br` (ou URL de nuvem configurada) | Produção na nuvem conectada ao MongoDB Atlas |

---

## 1. Módulo de Usuários e Autenticação

### 1.1. Login
- **Endpoint:** `POST /api/users/login`
- **Headers:** `Content-Type: application/json`
- **Payload de Entrada (Request):**
  ```json
  {
    "email": "string (email valido)",
    "senha": "string (minimo 6 caracteres)"
  }
  ```
- **Payload de Saída (Response 200):**
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "id": "string",
      "nome": "string",
      "email": "string"
    }
  }
  ```
- **Esquema Zod:** `loginResponseSchema`

### 1.2. Registro
- **Endpoint:** `POST /api/users/register`
- **Headers:** `Content-Type: application/json`
- **Payload de Entrada (Request):**
  ```json
  {
    "nome": "string",
    "email": "string",
    "senha": "string"
  }
  ```
- **Payload de Saída (Response 201):**
  ```json
  {
    "message": "string",
    "token": "string (opcional)",
    "user": {
      "id": "string",
      "nome": "string",
      "email": "string"
    }
  }
  ```

### 1.3. Perfil do Usuário Logado
- **Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Payload de Saída (Response 200):**
  ```json
  {
    "_id": "string",
    "nome": "string",
    "email": "string"
  }
  ```

---

## 2. Módulo de Imóveis (Properties)

### 2.1. Listar Imóveis
- **Endpoint:** `GET /api/imoveis`
- **Headers:** `Authorization: Bearer <token>`
- **Payload de Saída (Response 200 - Array):**
  ```json
  [
    {
      "_id": "string",
      "nome": "string",
      "tipo": "string (Residencial | Comercial | Industrial | Rural)",
      "rua": "string",
      "numero": "string",
      "bairro": "string",
      "cidade": "string",
      "estado": "string",
      "cep": "string",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ]
  ```

### 2.2. Criar Imóvel
- **Endpoint:** `POST /api/imoveis`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Payload de Entrada (Request):**
  ```json
  {
    "nome": "string",
    "tipo": "string",
    "rua": "string (opcional)",
    "numero": "string (opcional)",
    "bairro": "string (opcional)",
    "cidade": "string (opcional)",
    "estado": "string (opcional)",
    "cep": "string (opcional)"
  }
  ```

### 2.3. Deletar Imóvel
- **Endpoint:** `DELETE /api/imoveis/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## 3. Módulo de Arquivos e Despesas (Invoices/Files)

### 3.1. Listar Arquivos / Notas Fiscais
- **Endpoint:** `GET /api/uploads`
- **Query Params:** `propertyId` (opcional)
- **Headers:** `Authorization: Bearer <token>`
- **Payload de Saída (Response 200 - Array):**
  ```json
  [
    {
      "_id": "string",
      "title": "string",
      "value": "number",
      "purchaseDate": "string",
      "property": "string | { _id: string, nome: string }",
      "category": "string",
      "subcategory": "string",
      "observation": "string (opcional)",
      "filePath": "string (opcional)"
    }
  ]
  ```

### 3.2. Registrar Arquivo / Despesa
- **Endpoint:** `POST /api/uploads`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Payload de Entrada (Request):**
  ```json
  {
    "title": "string",
    "value": "number",
    "purchaseDate": "string (YYYY-MM-DD)",
    "property": "string (ObjectId)",
    "category": "string",
    "subcategory": "string",
    "observation": "string (opcional)",
    "filePath": "string (opcional)"
  }
  ```

### 3.3. Deletar Arquivo
- **Endpoint:** `DELETE /api/uploads/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## 4. Módulo de Inteligência Artificial (Gemini)

### 4.1. OCR e Extração de Nota Fiscal
- **Endpoint:** `POST /api/ai/extract`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:** `file` (arquivo binário / imagem / PDF)
- **Payload de Saída (Response 200):**
  ```json
  {
    "message": "string",
    "data": {
      "valor": "number (opcional)",
      "data": "string (opcional)",
      "cnpj": "string (opcional)",
      "categoria": "string (opcional)",
      "descricao": "string (opcional)"
    },
    "filePath": "string"
  }
  ```

### 4.2. Chat RAG sobre Notas Fiscais
- **Endpoint:** `POST /api/ai/query`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Payload de Entrada:**
  ```json
  {
    "query": "string"
  }
  ```
- **Payload de Saída (Response 200):**
  ```json
  {
    "answer": "string"
  }
  ```

---

## 5. Políticas de Segurança e Limitação de Taxa (Rate Limiting)

Para proteger a integridade do sistema, prevenir ataques de negação de serviço e força bruta, o backend implementa as seguintes regras na camada HTTP:

### 5.1. Proteção de Autenticação (`/api/users/login` e `/api/users/register`)
- **Mecanismo:** `express-rate-limit`
- **Janela de Tempo:** 15 minutos (900.000 ms)
- **Teto de Requisições:** Máximo de 20 tentativas por IP
- **Resposta em Excesso (HTTP 429):**
  ```json
  {
    "message": "Muitas tentativas de login/registro. Tente novamente em 15 minutos."
  }
  ```

### 5.2. Proteção de Custos e Quota na IA Gemini (`/api/ai/*`)
- **Mecanismo:** `express-rate-limit`
- **Janela de Tempo:** 1 minuto (60.000 ms)
- **Teto de Requisições:** Máximo de 15 requisições por IP
- **Resposta em Excesso (HTTP 429):**
  ```json
  {
    "message": "Limite de requisições para a IA excedido. Aguarde um minuto."
  }
  ```

### 5.3. Higienização Contra Injeção NoSQL
- **Middleware:** Sanitizador recursivo em `req.body` e `req.params`
- **Regra:** Chaves contendo o prefixo `$` (operadores MongoDB como `$ne`, `$gt`, `$where`) ou o caractere `.` (navegação de subdocumentos arbitrária) são expurgadas antes de qualquer operação de persistência.

### 5.4. Blindagem de Cabeçalhos HTTP
- **Middleware:** `helmet`
- **Diretivas Ativas:**
  - Supressão de `X-Powered-By: Express` (anti-fingerprinting)
  - `Cross-Origin-Resource-Policy: cross-origin` para interoperabilidade com o cliente mobile.
