# ADR-003: Estratégia de Alternância de Ambientes e Profile Switcher — NotaGest Mobile

- **Status:** Aceito
- **Data:** 19/09/2026
- **Decisores:** Equipe de Desenvolvimento e Lead Architect

---

## 1. Contexto e Problema
Com a migração bem-sucedida do aplicativo mobile e a compilação do APK nativo, surgiu a necessidade operacional de gerenciar a conectividade entre dois ecossistemas distintos:
1. **Ambiente de Desenvolvimento / Testes (Local):** Node.js na porta 5000, Metro nas portas 8081/8082, frontend web na porta 4000 e MongoDB local via Docker.
2. **Ambiente de Homologação / Produção (Nuvem Pública):** Backend hospedado em nuvem gerenciada, frontend web corporativo e banco de dados gerenciado no MongoDB Atlas.

Desafios identificados:
- Se as URLs fossem alternadas automaticamente via scripts de build ou variáveis como `__DEV__` / `NODE_ENV`, a equipe de Quality Assurance (QA) e os desenvolvedores perderiam a flexibilidade de rodar a versão local de desenvolvimento apontando diretamente para a API de produção na nuvem sem precisar compilar um APK de release inteiro.
- Por outro lado, exigir que o desenvolvedor ou QA alterasse manualmente múltiplas URLs longas em arquivos de configuração aumentaria drasticamente o risco de erros de digitação (*typos*) e retrabalho.

---

## 2. Decisão Arquitetural

### 2.1. Adoção do Padrão Profile Switcher (Strategy Pattern)
Adotou-se o padrão corporativo de **Chave Mestra de Perfil**, inspirado em frameworks como Spring Boot (`spring.profiles.active`) e Vite:
- O arquivo `.env` do aplicativo mobile define uma única chave mestre:
  - `EXPO_PUBLIC_APP_ENV=dev` (Ambiente Local Docker)
  - `EXPO_PUBLIC_APP_ENV=prod` (Ambiente Nuvem Render)

### 2.2. Catálogo Tipado e Validação na Borda via Zod
No arquivo `src/core/config/env.ts`, centralizou-se o mapeamento das URLs em um catálogo imutável (`ENV_CATALOG`):
- O esquema Zod valida em tempo de execução se o valor de `environment` pertence estritamente ao enum `['dev', 'prod']`. Valores inválidos disparam erro imediato na inicialização.
- Implementou-se resolução dinâmica de host (`resolveHostForPlatform`):
  - Em ambiente Web: utiliza `http://localhost:5000`.
  - Em emulador Android: resolve automaticamente para o loopback do emulador `http://10.0.2.2:5000`.
  - Em produção ou dispositivo físico: preserva a URL HTTPS configurada para a infraestrutura de nuvem.

### 2.3. Precedência de Override Manual
Caso seja necessário apontar temporariamente para um IP customizado ou túnel reverso (ex: ngrok), a variável `EXPO_PUBLIC_API_URL` mantém prioridade sobre o catálogo se for explicitamente preenchida.

---

## 3. Consequências

### Positivas:
- **Ergonomia e Simplicidade:** Alternância de ambiente com a alteração de apenas uma palavra no `.env`.
- **Prevenção de Erros Humanos:** Elimina a necessidade de copiar e colar URLs longas e complexas.
- **Agilidade de QA:** Permite que o time de testes valide telas em modo web ou desenvolvimento consumindo o banco e a API da nuvem instantaneamente.
- **Conformidade com The Twelve-Factor App:** Configurações rigorosamente desacopladas da lógica de apresentação e domínio.

### Negativas / Trade-offs:
- As URLs dos ambientes oficiais (`dev` e `prod`) residem no catálogo tipado da aplicação, exigindo atualização do catálogo caso o domínio de produção mude.
