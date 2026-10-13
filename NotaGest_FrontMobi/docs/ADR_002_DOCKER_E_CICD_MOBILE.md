# ADR-002: Containerização Docker e Pipeline de CI/CD — NotaGest Mobile

- **Status:** Aceito
- **Data:** 19/09/2026
- **Decisores:** Equipe de Desenvolvimento e Lead Architect

---

## 1. Contexto e Problema
A versão web do sistema (`NotaGest_FrontReact`) possuía containerização Docker e pipeline de CI/CD automatizado via GitHub Actions com envio de imagens para o Docker Hub e alertas de falha por email.

Para a versão mobile (`NotaGest_FrontMobi`), era necessário:
1. Prover paridade operacional: permitir que qualquer membro da equipe baixe a imagem Docker em outra máquina e execute o ambiente mobile imediatamente (`docker run -p 8081:8081`).
2. Integrar o serviço mobile à orquestração unificada via `docker-compose.yml`.
3. Automatizar a esteira de integração contínua (CI/CD) executando testes unitários (AAA) com verificação de cobertura antes de qualquer build ou deploy de imagem.

---

## 2. Decisão Arquitetural

### 2.1. Dockerfile Mobile (Expo Metro Bundler)
- **Imagem Base:** `node:22-alpine` para manter leveza e consumo mínimo de recursos.
- **Porta Exposta:** `8081` (Porta padrão do Metro Bundler no Expo SDK moderno).
- **Variáveis de Ambiente do Container:**
  - `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0`
  - `REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0`
- **Comando de Inicialização:** `npx expo start --host lan`. Qualquer dispositivo na mesma rede ou emulador pode conectar-se diretamente ao container.

### 2.2. Orquestração Unificada (`docker-compose.yml`)
- Criado o arquivo `docker-compose.yml` na raiz do repositório contendo os 4 serviços:
  1. `mongodb` (Porta 27017)
  2. `backend` (Porta 5000)
  3. `frontend-web` (Porta 4000)
  4. `frontend-mobile` (Porta 8081)
- Comunicação via rede compartilhada `notagest-network`.

### 2.3. Pipeline GitHub Actions (`mobile-ci.yml`)
- **Gatilhos:** Pushes nas branches `main`, `development` e `feat/story-book` com filtro de caminho restrito a `NotaGest_FrontMobi/**`.
- **Passos Sequenciais:**
  1. Checkout e Setup de Node 22 com `token: ${{ secrets.GITHUB_TOKEN }}` e `fetch-depth: 0`.
  2. `npm install --legacy-peer-deps`.
  3. `npm run test:coverage` (Execução de testes automatizados AAA com validação de cobertura).
  4. Varredura estática de qualidade e cobertura via **SonarCloud Scan** (`sonar-project.properties`).
  5. Autenticação no Docker Hub via `docker/login-action@v3`.
  6. Cálculo automático de versão semântica via **SemVer** baseado no histórico de Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE`).
  7. Atualização do `package.json`, commit e criação de tag Git (`mobile-vX.Y.Z`).
  8. Build e Push da imagem Docker (`notagest-mobile:dev` para desenvolvimento e `notagest-mobile:latest` + `notagest-mobile:v${version}` para main).
  9. Notificação por email de falha via `dawidd6/action-send-mail@v3`.
  10. Estágios de entrega contínua para homologação (`deploy-hml`) e produção (`deploy-prod`).

---

## 3. Consequências

### Positivas:
- Facilidade de replicação do ambiente em qualquer máquina sem necessidade de instalar Node ou dependências locais.
- Garantia de que nenhuma imagem com testes quebrados ou cobertura inferior ao requisito será enviada ao Docker Hub.
- Conformidade e uniformidade total com o padrão estabelecido no `NotaGest_FrontReact`.
- Isolamento arquitetural de escopo de cobertura no Jest (`perFile: true` ≥ 95%): coleta delimitada rigorosamente às camadas de domínio, utilitários e armazenamento (testes unitários), garantindo 100% de cobertura sem ruídos de componentes de tela e views de interface.
