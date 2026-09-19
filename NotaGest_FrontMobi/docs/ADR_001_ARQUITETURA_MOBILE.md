# ADR-001: Arquitetura Base, Stack Tecnológica e Padrões de Engenharia — NotaGest Mobile

- **Status:** Aceito
- **Data:** 19/09/2026
- **Decisores:** Equipe de Desenvolvimento e Lead Architect

---

## 1. Contexto e Problema
A aplicação NotaGest possuía uma implementação web em Next.js 15 (`NotaGest_FrontReact`), consumindo um backend em Node.js com Express e MongoDB (`NotaGest_Backend`). Havia a necessidade de prover uma versão mobile nativa de alto desempenho, usabilidade superior e segurança condizente com ambientes de produção bancários e imobiliários.

Desafios principais:
1. Comunicação de rede em ambientes heterogêneos (Emulador Android, Simulador iOS, Dispositivo Físico).
2. Armazenamento seguro de credenciais e tokens de sessão.
3. Ergonomia do usuário (HCI) em dispositivos com telas verticais de toque único.
4. Manutenção rigorosa de contratos com o backend existente, sem quebras silenciosas.
5. Manutenção de padrão de qualidade com testes automatizados confiáveis.

---

## 2. Decisão Arquitetural

### 2.1. Framework e Tooling
Adotou-se o **Expo SDK 57 (Managed Workflow) com TypeScript**:
- **Expo Router:** Roteamento baseado em arquivos alinhado à lógica mental já dominada pela equipe no Next.js.
- **TypeScript:** Tipagem estrita ativada, sem uso de `any` ou asserções desprovidas de validação.

### 2.2. Segurança e Persistência de Dados
- **Eliminação do `localStorage`:** Proibido o uso de armazenamento em texto plano para dados confidenciais.
- **Adoção do `expo-secure-store`:** Persistência de tokens JWT através do hardware criptográfico (Android Keystore e iOS Keychain).

### 2.3. Validação de Borda (Data Integrity)
- **Zod como Guard Clause:** Todos os dados recebidos das rotas da API (`/api/users`, `/api/imoveis`, `/api/uploads`, `/api/ai`) devem ser parseados por esquemas Zod imediatamente ao retornar do cliente Axios. Se o backend retornar payload divergente, o erro é interceptado na borda com log estruturado, prevenindo falhas no estado visual.

### 2.4. Design de Interação Humano-Computador (HCI)
- **Ergonomia — Thumb Zone:**
  - **Área Inferior (Natural Zone):** Bottom Tabs para navegação principal e Floating Action Button (FAB) para ações críticas (ex: escanear nota fiscal). Uso de Bottom Sheets em vez de modais suspensos.
  - **Área Central (Stretch Zone):** Feeds de conteúdo e gráficos financeiros com gestos horizontais.
  - **Área Superior (Ow Zone):** Apenas leitura, títulos e indicadores de rede.
- **Áreas de Toque:** Mínimo de 44x44 dp para qualquer elemento interativo.

### 2.5. Qualidade e Testes (AAA)
- **Metodologia:** Arrange-Act-Assert em todos os testes unitários e de componentes.
- **Ferramentas:** Jest + `@testing-library/react-native`.
- **Threshold de Cobertura:** 95% obrigatório por arquivo individual (`perFile: true`) em declarações, funções, ramos e linhas.

---

## 3. Consequências

### Positivas:
- Prevenção total de bugs silenciosos de contrato de API via Zod.
- Proteção de dados sensíveis de autenticação contra extrações não autorizadas.
- Interface mobile altamente intuitiva e ergonômica baseada no alcance do polegar.
- Rastreabilidade e auditabilidade completas para fins de conformidade e prova de operação.

### Negativas / Trade-offs:
- Curva inicial de implementação de esquemas Zod para todos os endpoints do backend.
- Exigência de disciplina rigorosa para manter 95% de cobertura em testes em cada arquivo novo.
