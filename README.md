# 🌐 Monitor Dashboard (NOC Edition)

Um sistema premium de monitoramento de infraestrutura (NOC - Network Operations Center) desenvolvido para equipes de DevOps, SREs (Site Reliability Engineers) e administradores de sistemas que precisam de visibilidade em tempo real sobre a saúde de seus serviços.

![Monitor Dashboard](https://img.shields.io/badge/Status-Operational-brightgreen) ![Docker](https://img.shields.io/badge/Docker-Enabled-blue) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-success) ![React](https://img.shields.io/badge/React-18-61DAFB)

---

## 🎯 Para quem é este Dashboard?

O **Monitor Dashboard** foi criado para:
- **Equipes de DevOps e SREs:** Para acompanhar métricas vitais de CPU e Memória e identificar picos de anomalia rapidamente.
- **SysAdmins e NOCs (Centrais de Operações):** Oferece um *Global Status Banner* e um painel de *Incidentes Ativos* projetado para grandes monitores de operação, indicando imediatamente o que caiu e a gravidade (Degradado ou Crítico).
- **Tech Leads e CTOs:** Uma visão gerencial agrupada por categorias (API, WEB, DATABASE) para acompanhar o Uptime global da arquitetura do projeto.

---

## ✨ Principais Funcionalidades

- **🚨 Painel de Incidentes Ativos:** Traz para o topo qualquer serviço que esteja `DOWN` ou `DEGRADED`, destacando-o com animações de alerta (Pulse/Glow).
- **📊 Status Global e Uptime:** Cálculo de saúde geral da infraestrutura baseado na quantidade de serviços inativos.
- **📈 Gráficos em Tempo Real:** Monitoramento histórico de consumo de RAM e CPU.
- **🗂️ Agrupamento Inteligente (Context-Aware):** Layout no formato "Dense" para acompanhar dezenas de serviços categorizados simultaneamente.
- **🎨 Glassmorphism Design:** Interface escura, moderna e focada na legibilidade, com padrão de UI utilizado em ferramentas líderes de mercado.

---

## 🚀 Como Instalar e Executar

O projeto já vem empacotado para rodar isolado usando contêineres.

### 1. Pré-requisitos
- **Docker** e **Docker Compose** instalados na sua máquina.

### 2. Configurando a Segurança (IMPORTANTE)
O repositório **não** carrega chaves sensíveis. Antes de rodar, renomeie o arquivo `.env.example` para `.env` na raiz do projeto (se aplicável) ou deixe que o Docker Compose assuma as credenciais de desenvolvimento padrão.

> **Aviso de Segurança para o GitHub:** 
> O arquivo `.env` já está no `.gitignore`. Nunca faça commit de senhas reais, tokens JWT ou credenciais de banco de dados.

### 3. Subindo a Infraestrutura

Abra o terminal na pasta raiz do projeto e execute:
```bash
docker compose up -d --build
```

O comando acima iniciará 3 contêineres:
1. `monitor_db`: Banco de dados PostgreSQL (na porta 5435 do host).
2. `monitor_api`: O Backend Spring Boot executando as checagens e a API.
3. `monitor_ui`: O Frontend em React servido via Nginx.

### 4. Acessando o Dashboard

Assim que os serviços estiverem com status `Healthy` (você pode verificar com `docker compose ps`), acesse no seu navegador:

🔗 **http://localhost:5173**

### 5. Credenciais de Acesso (Administrador Padrão)
Por padrão (em ambiente de desenvolvimento), o banco de dados é populado com um usuário administrador:
- **E-mail:** `admin@monitor.dev`
- **Senha:** `admin123`

---

## 🛠️ Stack Tecnológica
- **Frontend:** React 18, Vite, Zustand (State Management), CSS Modules, Recharts.
- **Backend:** Java 21, Spring Boot 3, Spring Security (JWT), Flyway (Migrations).
- **Database:** PostgreSQL 16.
- **Infra:** Docker & Nginx.
