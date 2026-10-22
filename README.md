# TripShare Demo (rota)

Protótipo front-end de planejamento de viagens colaborativo e rede social de roteiros (focado no Rio de Janeiro), construído com **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS v4** e **shadcn/ui**.

---

## 🎨 Paleta de Cores Oficial — *Copacabana Ocean*

A identidade visual oficial do projeto utiliza o tema **Copacabana Ocean**, inspirado na orla e no mar do Rio de Janeiro, combinando tons de azul oceânico com superfícies claras e frescas.

### Tokens Principais (CSS Variables em `app/globals.css`)

| Token | Variável CSS | Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `#0077B6` | Botões principais, ícones de destaque, links ativos e badges |
| **Primary Foreground** | `--primary-foreground` | `#FFFFFF` | Texto e ícones sobre elementos `--primary` |
| **Brand Gradient (From)** | `--brand-from` | `#0096C7` | Início do gradiente de ações de destaque (ex.: *Distribuir Viagem*, *Gerar Roteiro*) |
| **Brand Gradient (To)** | `--brand-to` | `#023E8A` | Fim do gradiente de ações de destaque |
| **Background** | `--background` | `#F8FDFF` | Fundo geral das páginas (branco gelo suave) |
| **Foreground** | `--foreground` | `#0A2540` | Texto principal e títulos (azul-marinho profundo) |
| **Card / Popover** | `--card` / `--popover` | `#FFFFFF` | Superfície de cartões, modais e popovers |
| **Secondary / Muted** | `--secondary` / `--muted` | `#EBF5F8` | Fundos secundários, áreas agrupadas e containers sutis |
| **Muted Foreground** | `--muted-foreground` | `#4A6B82` | Textos de apoio, legendas, horários e metadados |
| **Accent** | `--accent` | `#E0F0F6` | Estado de hover em botões secundários, menus e itens selecionáveis |
| **Border** | `--border` | `#D8E8F0` | Divisórias, bordas de cartões e contornos |
| **Input** | `--input` | `#C5DCE8` | Bordas de campos de formulário e seletores |
| **Ring** | `--ring` | `#0077B6` | Anel de foco de acessibilidade (`focus-visible`) |
| **Destructive** | `--destructive` | `#C13515` | Alertas de conflito de horário e ações de exclusão |

### Cores Semânticas dos Turnos do Roteiro

Os turnos do cronograma diário e os pins do mapa mantêm cores semânticas fixas para rápida identificação visual:

| Turno | Horário | Variável CSS | Hex | Texto (`onColor`) |
| :--- | :--- | :--- | :--- | :--- |
| **Manhã** | `06:00 – 12:00` | `--color-shift-manha` | `#F5B301` | `#3D2C00` |
| **Tarde** | `12:00 – 18:00` | `--color-shift-tarde` | `#F2711C` | `#FFFFFF` |
| **Noite** | `18:00 – 00:00` | `--color-shift-noite` | `#38BDF8` | `#06304A` |
| **Madrugada** | `00:00 – 06:00` | `--color-shift-madrugada` | `#7C3AED` | `#FFFFFF` |

### Temas Alternativos

Além da paleta oficial **Copacabana Ocean** (`ocean`), o aplicativo disponibiliza temas alternativos em **Configurações → Paleta de cores** (controlados via atributo `data-theme` no elemento `<html>`):

- `ocean`: **Copacabana Ocean** (Oficial / Padrão)
- `coral`: **Coral Sunset** (`#FF385C` / `#E61E4D` → `#D70466`)
- `forest`: **Tijuca Forest** (`#1B6B4A` / `#2D8A61` → `#134E35`)
- `golden`: **Ipanema Golden Hour** (`#D95D39` / `#F2711C` → `#C84B31`)
- `midnight`: **Lapa Midnight** (Modo escuro — `#FF4D6D` / `#7C3AED` → `#DB2777`)

---

## 🚀 Como Executar

```bash
pnpm install
pnpm dev
```

Acesse `http://localhost:3000` no navegador.
