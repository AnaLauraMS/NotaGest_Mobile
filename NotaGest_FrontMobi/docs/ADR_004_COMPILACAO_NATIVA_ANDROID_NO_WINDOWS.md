# ADR-004: Engenharia de Compilação Nativa Android no Ambiente Windows — NotaGest Mobile

- **Status:** Aceito
- **Data:** 19/09/2026
- **Decisores:** Equipe de Desenvolvimento e Lead Architect

---

## 1. Contexto e Problema
Para a distribuição do NotaGest no ecossistema Android, foi solicitada a geração de um executável nativo independente (`.apk`). O projeto utiliza **React Native 0.86** com a **Nova Arquitetura (TurboModules + Fabric)** e **Expo SDK 57**, executando a compilação localmente em uma estação de trabalho com Windows 10, AMD Ryzen 5 (12 cores) e 32GB RAM.

Durante a execução da tarefa `./gradlew assembleRelease`, foram encontrados três impedimentos de infraestrutura nativa e compiladores no Windows:

1. **Stack Overflow no Compilador MinGW Clang C++:**
   - O Clang 18 empacotado no Android NDK 27 para Windows possui um limite padrão de thread stack de apenas 1MB (em contraste com 8MB em distribuições Linux).
   - Ao compilar o arquivo gerado de autolinking (`autolinking.cpp`), o compilador instanciou dezenas de templates Fabric C++ (notadamente de `react-native-svg` e `react-native-screens`) com otimização `-O2`, gerando recursão profunda de AST que causou estouro de pilha e encerramento abrupto com erro de sinal (`clang frontend command failed due to signal`).

2. **Limite de Comprimento de Caminho no Ninja (MAX_PATH / 260 caracteres):**
   - O binário do Ninja empacotado no Android SDK (`cmake/3.22.1/bin/ninja.exe`, versão 1.10.2 lançada em 2020) utilizava chamadas legadas da API Win32 que ignoram caminhos estendidos do Windows, falhando com o erro:
     `ninja: error: Stat(...): Filename longer than 260 characters` devido a caminhos intermediários do CMake com 275 caracteres.

3. **Esgotamento de Memória Nativa (JVM Malloc Failure / Processos Zumbis):**
   - Múltiplos Daemons do Gradle anteriores permaneceram alocados em segundo plano. Com a flag `org.gradle.parallel=true`, o Gradle tentou instanciar 12 workers paralelos concorrendo com os processos do Ninja, esgotando o limite de commits de memória do Windows (`Out of Memory Error (arena.cpp:191)`).

---

## 2. Decisão Arquitetural

### 2.1. Otimização Cirúrgica do NDK Clang C++
- No arquivo `android/app/build.gradle`, injetou-se a flag `-DCMAKE_CXX_FLAGS_RELWITHDEBINFO=-O1 -g -DNDEBUG` no bloco `defaultConfig.externalNativeBuild.cmake`.
- O nível de otimização `-O1` reduz a profundidade de recursão e inlining de templates C++, permitindo compilação estável dentro do limite de 1MB de pilha do Windows sem perda de desempenho perceptível em tempo de execução.

### 2.2. Atualização do Binário Ninja para Suporte a Long Paths
- Substituiu-se o binário legado Ninja 1.10.2 da pasta do Android SDK pelo **Ninja 1.12.1** oficial para Windows x64.
- A versão 1.12.1 implementa suporte nativo ao prefixo de caminhos estendidos do Windows (`\\?\`), permitindo manipular caminhos que ultrapassam 260 caracteres.
- Adicionalmente, injetou-se a propriedade `-DCMAKE_OBJECT_PATH_MAX=1024` no CMake do Gradle.

### 2.3. Gestão e Dimensionamento de Recursos da JVM
- Interromperam-se todos os Daemons zumbis via `gradlew --stop`.
- No arquivo `android/gradle.properties`:
  - `org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m` (4GB de heap dedicados).
  - `org.gradle.parallel=false` e `org.gradle.workers.max=2` (limitação de threads paralelas para prevenir saturação do subsistema de I/O do Windows).
  - `reactNativeArchitectures=arm64-v8a` (foco restrito à arquitetura de smartphones modernos reais, reduzindo o volume de compilação C++ em 75%).

---

## 3. Consequências

### Positivas:
- **Compilação 100% Local Concluída com Sucesso:** Binário standalone gerado em 4m 15s (`android/app/build/outputs/apk/release/app-release.apk`, ~45,6 MB).
- **Independência de Filas na Nuvem:** O binário pôde ser gerado sem necessidade de conta, tokens ou esperas no Expo Application Services (EAS).
- **Reprodutibilidade:** O ambiente Windows local tornou-se totalmente apto a compilar releases futuras do projeto com estabilidade.

### Negativas / Trade-offs:
- Exigiu substituição pontual do executável `ninja.exe` na árvore do Android SDK local do desenvolvedor.
