# 📊 Monitor — Dashboard Full Stack

Dashboard de monitoramento em tempo real com Java/Spring Boot + React.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## ✨ Funcionalidades

- 🟢 Health checks automáticos a cada 30s em todos os serviços
- 📈 Coleta de métricas do sistema (CPU, RAM, Threads JVM) a cada 15s
- 🔔 Alertas automáticos quando serviços ficam DOWN
- 📊 Gráficos em tempo real com Recharts
- 🔐 Autenticação JWT com BCrypt
- 🌐 REST API documentada com Swagger
- 🗄️ Migrations versionadas com Flyway
- 🐳 Stack completa com Docker Compose

---

## 🚀 Início Rápido

### Pré-requisito
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado

### Subir tudo com 1 comando

```bash
git clone https://github.com/SEU_USUARIO/monitor.git
cd monitor
docker compose up -d
```

Aguarde ~2 minutos na primeira vez (compila o Java).

| Serviço      | URL                                    |
|--------------|----------------------------------------|
| Dashboard    | http://localhost:5173                  |
| API Swagger  | http://localhost:8080/swagger-ui.html  |
| API Health   | http://localhost:8080/actuator/health  |

**Login:** `admin@monitor.dev` / `admin123`

---

## 🗄️ Banco de Dados

Configuração local (sem Docker):

| Campo    | Valor       |
|----------|-------------|
| Host     | localhost   |
| Porta    | 5432        |
| Banco    | monitor     |
| Usuário  | postgres    |
| Senha    | admin123    |

Para rodar o backend localmente sem Docker:

```bash
cd backend
# O banco precisa estar rodando em localhost:5432
./mvnw spring-boot:run
```

---

## 🔌 Endpoints da API

| Método   | Endpoint                        | Descrição                  |
|----------|---------------------------------|----------------------------|
| `POST`   | `/api/v1/auth/login`            | Login → JWT                |
| `GET`    | `/api/v1/dashboard`             | Resumo geral               |
| `GET`    | `/api/v1/services`              | Lista serviços             |
| `POST`   | `/api/v1/services`              | Cria serviço               |
| `DELETE` | `/api/v1/services/{id}`         | Desativa serviço           |
| `GET`    | `/api/v1/services/{id}/history` | Histórico de health checks |
| `GET`    | `/api/v1/metrics`               | Histórico de métricas      |
| `GET`    | `/api/v1/alerts`                | Alertas ativos             |
| `PATCH`  | `/api/v1/alerts/{id}/resolve`   | Resolve alerta             |

---

## 📁 Estrutura do Projeto

```
monitor/
├── .gitignore
├── README.md
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/dev/dashboard/monitor/
│       │   │   ├── MonitorApplication.java
│       │   │   ├── api/
│       │   │   │   ├── controller/
│       │   │   │   │   ├── AuthController.java
│       │   │   │   │   └── DashboardController.java
│       │   │   │   ├── dto/
│       │   │   │   │   └── Dtos.java
│       │   │   │   └── exception/
│       │   │   │       └── GlobalExceptionHandler.java
│       │   │   ├── config/
│       │   │   │   └── SecurityConfig.java
│       │   │   ├── domain/
│       │   │   │   ├── entity/
│       │   │   │   │   ├── Alert.java
│       │   │   │   │   ├── HealthCheck.java
│       │   │   │   │   ├── ServiceEntity.java
│       │   │   │   │   ├── SystemMetric.java
│       │   │   │   │   └── User.java
│       │   │   │   └── repository/
│       │   │   │       ├── AlertRepository.java
│       │   │   │       ├── HealthCheckRepository.java
│       │   │   │       ├── ServiceRepository.java
│       │   │   │       ├── SystemMetricRepository.java
│       │   │   │       └── UserRepository.java
│       │   │   ├── security/
│       │   │   │   ├── JwtAuthFilter.java
│       │   │   │   ├── JwtUtil.java
│       │   │   │   └── UserDetailsServiceImpl.java
│       │   │   └── service/
│       │   │       ├── DashboardService.java
│       │   │       └── HealthCheckService.java
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/
│       │           └── V1__init_schema.sql
│       └── test/
│           └── java/dev/dashboard/monitor/service/
│               └── DashboardServiceTest.java
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/
        │   └── client.ts
        ├── store/
        │   └── index.ts
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.tsx
        │   │   └── Layout.module.css
        │   └── ui/
        │       ├── GaugeRing.tsx + .module.css
        │       ├── MiniChart.tsx + .module.css
        │       ├── ServiceCard.tsx + .module.css
        │       └── StatCard.tsx + .module.css
        └── pages/
            ├── LoginPage.tsx + .module.css
            ├── OverviewPage.tsx + .module.css
            ├── ServicesPage.tsx + .module.css
            ├── MetricsPage.tsx + .module.css
            └── AlertsPage.tsx + .module.css
```

---

## 🛑 Comandos úteis

```bash
# Subir
docker compose up -d

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Ver status
docker compose ps

# Parar
docker compose down

# Parar e apagar banco
docker compose down -v

# Rebuild após mudanças
docker compose up -d --build
```

---

## 🐛 Bugs corrigidos nesta versão

- ✅ Hash BCrypt correto para `admin123` no seed
- ✅ `DaoAuthenticationProvider` explícito no Spring Security
- ✅ `JwtUtil` com padding automático para chaves curtas
- ✅ CORS com header `Authorization` exposto
- ✅ Banco configurado com senha `admin123`
- ✅ Interceptor axios sem loop infinito no 401
- ✅ `LoginPage` com tratamento correto de erros da API

---

## 💡 Próximas melhorias

- [ ] WebSocket para atualizações em tempo real
- [ ] Notificações por e-mail
- [ ] Exportar métricas para Prometheus + Grafana
- [ ] Testes de integração com Testcontainers

---

## 📄 Licença

MIT
