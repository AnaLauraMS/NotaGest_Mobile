# ADR-005: Safe Area Insets, Hierarquia Visual e Identidade da Marca — NotaGest Mobile

- **Status:** Aceito
- **Data:** 19/09/2026
- **Decisores:** Equipe de Desenvolvimento e Lead Architect

---

## 1. Contexto e Problema

Durante a validação operacional em dispositivos Android físicos e emuladores, foram identificadas três inconsistências críticas de experiência de usuário (UX) e identidade corporativa:

1. **Colisão da Barra de Abas com a Navegação Nativa do Android:**
   A barra de abas inferior (`AppTabs`) possuía altura estática de `64dp` fixada em `bottom: 0`. Em dispositivos com navegação clássica de 3 botões (Quadrado, Círculo e Triângulo) ou com gestos, os botões nativos do sistema operacional eram desenhados diretamente sobre os ícones e rótulos das abas, prejudicando a usabilidade e a estética do app.
2. **Desproporção do Logotipo na Tela de Login:**
   O logotipo na tela de autenticação estava configurado com dimensões de `140x140`. Em telas de alta resolução, o ícone aparentava tamanho reduzido em relação ao espaço disponível, prejudicando a hierarquia visual da marca.
3. **Ícone do Aplicativo no Launcher Utilizando Template Padrão:**
   O aplicativo estava utilizando o ícone de seta/chevron padrão do template Expo nos assets e mipmaps nativos do Android (`ic_launcher.webp`, `ic_launcher_foreground.webp`, etc.), em vez do símbolo exclusivo da marca NotaGest.

---

## 2. Decisão Arquitetural

### 2.1. Arquitetura de Safe Area e Prevenção de Colisão no Android

Para resolver de forma perene o problema de sobreposição com a barra de navegação do sistema:

1. **Inicialização Síncrona de Métricas:**
   No arquivo raiz `src/app/_layout.tsx`, passamos a registrar `initialMetrics={initialWindowMetrics}` no componente `<SafeAreaProvider>`, garantindo que as dimensões da janela e barras de sistema estejam disponíveis imediatamente na renderização inicial.
2. **Elevação Dinâmica da Barra de Abas (`AppTabs`):**
   No arquivo `src/components/app-tabs.tsx`, calculamos o recuo inferior com fallback protetivo para o Android:
   - `const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);`
   - Altura total do container: `height: 64 + bottomInset`.
   - Preenchimento inferior: `paddingBottom: bottomInset`.
   - Alinhamento superior: `justifyContent: 'flex-start'`.
   - **Efeito Visual:** Os 4 botões de navegação permanecem fixados nos primeiros `64dp` no topo do componente, enquanto a área inferior correspondente ao `bottomInset` atua como moldura de fundo sob os botões nativos do Android.
3. **Adequação das Telas Filhas:**
   Em todas as telas com navegação interna (`Dashboard`, `Imóveis`, `Notas Fiscais` e `Assistente IA`):
   - O `<SafeAreaView>` foi configurado com `edges={['top', 'left', 'right']}`, delegando a gestão do recuo inferior à barra de abas.
   - O `contentContainerStyle` dos `ScrollView` recebeu `paddingBottom: 100 + bottomInset`, assegurando que o último card ou ação da lista nunca fique oculto sob a barra de abas.
   - Na tela do Assistente IA, o container de input flutuante foi elevado para `bottom: 76 + bottomInset` com `paddingBottom: 150 + bottomInset` na lista de mensagens.
   - Na folha de captura de notas (`InvoiceCaptureSheet`), adicionou-se `paddingBottom: 24 + bottomInset`.

### 2.2. Ampliação da Hierarquia Visual no Login

No componente `src/components/auth/LoginScreen.tsx`:
- As dimensões do logotipo foram ampliadas em 100% (de `140x140` para `280x280` com `maxWidth: '90%'` e `maxHeight: 280`).
- O container principal utiliza `<SafeAreaView edges={['top', 'bottom', 'left', 'right']}>`, garantindo isolamento contra entalhes (notches) e barras de navegação.

### 2.3. Sistema de Ícones Adaptativos da Marca NotaGest

Substituímos todos os ativos genéricos pelo símbolo geométrico oficial da marca NotaGest (as formas estilizadas de edifícios e dobra em origami):

1. **Isolamento do Símbolo:**
   A partir do arquivo mestre `assets/notagest/LogoNotaGestLogin.png` (1024x1024), extraímos exclusivamente o elemento gráfico (ícone), excluindo a tipografia textual inferior.
2. **Conformidade com a Safe Zone do Android Adaptive Icon:**
   - **Resolução do Canvas:** `108dp x 108dp` (432px em xxxhdpi).
   - **Safe Zone:** Diâmetro central de `72dp` (~66% da largura). O símbolo foi centralizado com escala de 58%, garantindo que nenhuma parte seja cortada por máscaras circulares, squircles ou retângulos arredondados de fabricantes (Samsung, Xiaomi, Google Pixel, Motorola).
3. **Geração Completa dos Mipmaps Nativos (`android/app/src/main/res/`):**
   - Densidades `mdpi` (1x), `hdpi` (1.5x), `xhdpi` (2x), `xxhdpi` (3x) e `xxxhdpi` (4x).
   - Gerados os arquivos `ic_launcher.webp`, `ic_launcher_round.webp`, `ic_launcher_foreground.webp`, `ic_launcher_background.webp` (fundo branco puro `#FFFFFF`) e `ic_launcher_monochrome.webp` (compatibilidade com Material You / Android 13+).
4. **Splash Screen Nativa:**
   - Atualizados os arquivos `splashscreen_logo.png` em todas as densidades `drawable-*`, garantindo consistência visual da marca durante a animação de splash do sistema operacional.

---

## 3. Consequências

### Positivas:
- **Zero Colisões de UI:** A interface respeita a geometria física e de software de qualquer aparelho Android, independentemente do tipo de navegação ativado pelo usuário.
- **Identidade Visual Profissional:** O aplicativo apresenta o ícone autêntico da marca NotaGest no launcher, no switcher de tarefas, no splash screen e na tela de login.
- **Código Limpo:** Cumprimento estrito da diretriz de Zero Comentários em todos os arquivos TypeScript, JSON e Gradle.
- **Conformidade de Compilação:** 51 testes unitários aprovados com 100% de sucesso e zero erros de tipagem TypeScript.
