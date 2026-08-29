# Duda Pelas Lentes

Site profissional e painel administrativo da fotógrafa **Duda Pelas Lentes**
([@dudapelaslentes](https://instagram.com/dudapelaslentes)).

> *"Eternizando momentos desde 2017. Retratos para diferentes fases da vida."*

O sistema tem duas áreas:

1. **Site público** — Home, Portfólio, Sobre, Serviços, Depoimentos e Contato.
2. **Painel administrativo** (`/admin`) — a fotógrafa administra todo o conteúdo do
   site sem editar código.

Versão: `0.1.0-dev`.

---

## Arquitetura

```
DudaPelasLentes/
├── DudaPelasLentes.Api/            # Backend — ASP.NET Core Web API (.NET 10)
│   ├── Configuration/              # Option classes (Jwt, Storage, Images, Cors, BootstrapAdmin)
│   ├── Controllers/                # Endpoints públicos
│   │   └── Admin/                  # Endpoints protegidos (JWT / policy "Admin")
│   ├── Data/                       # DbContext + inicialização/seed
│   ├── DTOs/                       # Contratos de entrada/saída (nunca expõem entidades)
│   ├── Entities/                   # Modelo de domínio (EF Core)
│   ├── Middleware/                 # Tratamento global de erros
│   ├── Migrations/                 # Migrations do EF Core (PostgreSQL)
│   ├── Services/                   # Slug, hash de senha, JWT, processamento de imagem, mapeamento
│   └── Storage/                    # Abstração IFileStorage + implementação local
├── DudaPelasLentes.Api.Tests/      # Testes xUnit (unitários + integração com SQLite in-memory)
├── duda-pelas-lentes-web/          # Frontend — React 19 + Vite 8 + React Router
│   └── src/
│       ├── admin/                  # Painel administrativo (rotas, páginas, componentes)
│       ├── components/             # Header, Footer, Botão, Lightbox, SmartImage, ...
│       ├── hooks/                  # useApi, useSiteConfig
│       ├── layouts/                # PublicLayout
│       ├── lib/                    # cliente HTTP, formatação
│       ├── pages/                  # páginas públicas + seções da Home
│       └── styles/                 # design tokens + CSS por área
├── docs/referencias/              # Referência visual da Home
└── .github/workflows/ci.yml       # CI (build + test de API e Web)
```

### Stack

| Camada   | Tecnologia |
|----------|------------|
| Frontend | React 19, Vite 8, React Router 7, CSS puro com design tokens |
| Backend  | ASP.NET Core Web API (.NET 10), EF Core 10, autenticação JWT |
| Banco    | PostgreSQL 17 |
| Imagens  | [SixLabors.ImageSharp](https://github.com/SixLabors/ImageSharp) (redimensionamento + remoção de EXIF) |
| Testes   | xUnit + `Microsoft.AspNetCore.Mvc.Testing` (API), Vitest + Testing Library (Web) |

> **Licença do ImageSharp:** a partir da v3 o ImageSharp usa a *Six Labors Split License* —
> gratuito para projetos open source e para empresas com receita anual abaixo do limite
> definido pela Six Labors. Reavalie antes de um uso comercial de maior porte.

---

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- PostgreSQL 17

### Banco de desenvolvimento

Este projeto usa **explicitamente** uma instância dedicada — **não** a porta padrão 5432:

| Parâmetro | Valor |
|-----------|-------|
| Host      | `127.0.0.1` |
| Porta     | `5434` |
| Database  | `duda_pelas_lentes_dev` |
| Versão    | PostgreSQL 17 |

O database `duda_pelas_lentes_dev` deve existir. O projeto **não** cria nem apaga
databases automaticamente.

---

## Configuração local (User Secrets)

Nenhum segredo fica no repositório. No ambiente Development os valores vêm de
**.NET User Secrets**. Rode os comandos abaixo dentro de `DudaPelasLentes.Api/`,
substituindo os valores entre `< >`:

```bash
cd DudaPelasLentes.Api

# String de conexão (a senha é sua; nunca versione)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=127.0.0.1;Port=5434;Database=duda_pelas_lentes_dev;Username=<usuario>;Password=<senha>"

# Chave de assinatura do JWT — use uma string longa e aleatória (>= 32 caracteres)
dotnet user-secrets set "Jwt:Key" "<chave-aleatoria-longa>"

# Primeiro usuário (criado só em Development, só se não houver nenhum usuário).
# É criado como Master (acesso total + gestão de usuários).
dotnet user-secrets set "BootstrapAdmin:Email" "<seu-email-master>"
dotnet user-secrets set "BootstrapAdmin:Password" "<senha-forte-temporaria>"
# Opcional — o padrão já é Master:
# dotnet user-secrets set "BootstrapAdmin:Role" "Master"
```

Para gerar uma chave JWT aleatória rapidamente:

```bash
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
# bash
openssl rand -base64 48
```

### Perfis: Master e Admin

| Capacidade                                   | Master | Admin |
|----------------------------------------------|:------:|:-----:|
| Administrar todo o conteúdo do site          |   ✅   |  ✅   |
| Alterar a própria senha                      |   ✅   |  ✅   |
| Acessar *Usuários* (gestão de administradores)|   ✅   |  ❌   |
| Criar / editar / ativar-desativar Admin      |   ✅   |  ❌   |
| Redefinir senha de Admin                     |   ✅   |  ❌   |

A proteção é feita no backend por policy: `Admin` (Master **ou** Admin) nos endpoints
de conteúdo e `Master` nos endpoints `/api/admin/usuarios/*`. Sem token → 401;
Admin em rota de Master → 403. Esconder itens no frontend é apenas cosmético.

### Bootstrap do primeiro Master

Na primeira execução em Development, se **não existir nenhum usuário** e
`BootstrapAdmin:Email` + `BootstrapAdmin:Password` estiverem configurados, o sistema
cria o acesso automaticamente **como Master**. A senha **nunca** é logada. O Master
troca a própria senha pelo endpoint `POST /api/admin/auth/alterar-senha` e cria o
usuário Admin da Duda pela tela *Usuários → Novo Admin*.

Bases já existentes: a migration `AddUsuarioAdminRole` promove o usuário mais antigo
a Master e, na inicialização, o sistema garante que sempre exista ao menos um Master
ativo (promovendo o usuário de bootstrap, ou o mais antigo, se necessário).

---

## Migration

O modelo já possui a migration inicial (`Migrations/*_InitialCreate.cs`).
Para **aplicar no banco de desenvolvimento**, com a connection string já configurada
em User Secrets (a senha **não** vai no comando):

```bash
cd DudaPelasLentes.Api
dotnet ef database update
```

> Se o `dotnet ef` não estiver instalado: `dotnet tool install --global dotnet-ef`.

A API também aplica migrations pendentes automaticamente no boot **quando consegue
conectar** ao banco; se não conseguir, ela sobe mesmo assim e apenas registra um aviso.

---

## Uploads e imagens

- Formatos aceitos: **JPEG, PNG, WEBP**.
- Validação em camadas: extensão → MIME → *magic bytes* (assinatura do arquivo).
- Limite de tamanho configurável (`Images:MaxUploadBytes`, padrão 15 MB).
- Nomes de arquivo gerados por GUID; proteção contra *path traversal* na `LocalFileStorage`.
- Metadados EXIF/GPS/XMP/IPTC são removidos no processamento.
- Cada imagem gera 4 variantes: `original`, `large`, `medium`, `thumb`
  (dimensões e qualidade em `appsettings.json → Images`).
- Armazenamento local em `DudaPelasLentes.Api/storage-uploads/` (**não versionado**),
  servido em `/media/...`. A abstração `IFileStorage` permite trocar por
  Cloudflare R2 / S3 / Azure Blob futuramente sem mudar os controllers.

---

## Como rodar

### 1. API

```bash
cd DudaPelasLentes.Api
dotnet run
```

- API: <http://localhost:5073>
- OpenAPI (Development): <http://localhost:5073/openapi/v1.json>
- Health check: <http://localhost:5073/health>

### 2. Frontend

```bash
cd duda-pelas-lentes-web
cp .env.example .env      # opcional — em dev o proxy do Vite já cobre /api e /media
npm install
npm run dev
```

- Site: <http://localhost:5173>
- Painel: <http://localhost:5173/admin> → login em `/admin/login`

Em desenvolvimento o Vite faz proxy de `/api` e `/media` para `http://localhost:5073`,
então não é necessário configurar `VITE_API_URL`. Em produção, defina
`VITE_API_URL` apontando para o domínio da API.

---

## Testes

### API

```bash
dotnet test
```

Cobre: hashing de senha, geração de slug, links (wa.me/instagram), validação de upload,
*path traversal*, autenticação, autorização, endpoints públicos (incl. verificação de que
`SenhaHash` nunca é exposto), contato (honeypot + validação), CRUD de categorias/ensaios,
depoimentos e regra de publicação.

### Frontend

```bash
cd duda-pelas-lentes-web
npm test
```

Cobre: roteamento, 404, proteção da área `/admin`, tela de login, renderização da Home
com e sem dados da API, menu hamburger e utilitários (`format`, `api`).

---

## CI

`.github/workflows/ci.yml` roda a cada push/PR para `main`:

- **API:** `dotnet restore` → `build` (Release) → `test`
- **Web:** `npm ci` → `lint` → `test` → `build`

Não há passo de deploy.

---

## Segurança — resumo

- Nenhum segredo no Git (JWT, connection string e senhas ficam em User Secrets).
- Senhas com `PasswordHasher` do ASP.NET Core (PBKDF2).
- Autorização por policy: `Admin` (Master ou Admin) no conteúdo; `Master` na gestão
  de usuários. Sem token → 401; perfil insuficiente → 403.
- A role vai no JWT (claim `role`); o site público nunca expõe quem é Master, e-mails
  administrativos, lista de admins, tokens ou endpoints internos.
- CORS restrito às origens configuradas (`Cors:AllowedOrigins`); credenciais nunca
  combinadas com `AllowAnyOrigin`.
- Rate limiting em login, contato e uploads.
- Tratamento global de erros — *stack trace* nunca exposto fora de Development.
- Uploads validados por extensão + MIME + assinatura; limite de tamanho; nomes GUID.
- DTOs públicos dedicados — entidades e `SenhaHash` nunca são serializados ao cliente.
- Não são logados: senha, JWT, connection string ou conteúdo binário.

---

## Roadmap

- [ ] Substituir placeholders por fotografias reais (via painel).
- [ ] Logo oficial (arquivo) no lugar da versão tipográfica temporária.
- [ ] Sitemap + canonical quando houver domínio.
- [ ] Reordenação por *drag-and-drop* no painel (hoje: setas ←/→).
- [ ] Storage em nuvem (R2/S3) — a abstração já existe.
- [ ] E-mail de notificação de novos contatos.

## Deploy futuro

Ainda **não** há domínio e o deploy **não** está implementado. A arquitetura foi pensada
para rodar futuramente em **Linux + Nginx + Kestrel** ou **Windows Server + IIS**, sem
mudanças estruturais. O storage é configurável (`Storage:Provider`), e todas as
configurações sensíveis vêm de variáveis de ambiente / secret store em produção.
