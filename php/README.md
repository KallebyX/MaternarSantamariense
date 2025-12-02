# Maternar Santamariense - PHP Version

Sistema de gestão hospitalar desenvolvido em PHP puro.

## Requisitos

- PHP 8.0+
- PostgreSQL 13+
- Apache ou Nginx
- Extensões PHP:
  - pdo_pgsql
  - mbstring
  - json
  - session
  - fileinfo

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/maternar-santamariense.git
cd maternar-santamariense/php
```

### 2. Configure o banco de dados

Edite o arquivo `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'maternar_santamariense');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
```

### 3. Crie o banco de dados

```bash
createdb maternar_santamariense
psql maternar_santamariense < config/schema.sql
```

### 4. Configure o servidor web

#### Apache

Copie o arquivo `.htaccess` para o diretório raiz e habilite o mod_rewrite:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Nginx

Copie `nginx.conf` para `/etc/nginx/sites-available/` e crie um link simbólico:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/maternar
sudo ln -s /etc/nginx/sites-available/maternar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configure as permissões

```bash
chmod 755 -R .
chmod 777 -R uploads/
```

### 6. Acesse o sistema

Abra o navegador e acesse `http://seu-servidor/`

**Credenciais padrão:**
- Email: admin@maternarsantamariense.com
- Senha: admin123

## Estrutura do Projeto

```
php/
├── api/                    # Endpoints da API
│   ├── messages.php        # API de mensagens do chat
│   └── notifications.php   # API de notificações
├── assets/                 # Assets estáticos
│   ├── css/
│   ├── js/
│   └── images/
├── classes/                # Classes PHP
│   ├── Auth.php            # Autenticação
│   ├── Database.php        # Wrapper do banco de dados
│   └── User.php            # Gerenciamento de usuários
├── config/                 # Configurações
│   ├── config.php          # Configuração geral
│   ├── database.php        # Configuração do banco
│   └── schema.sql          # Schema do banco de dados
├── includes/               # Includes compartilhados
│   ├── header.php          # Header/sidebar
│   └── footer.php          # Footer/scripts
├── uploads/                # Uploads de usuários
│   └── avatars/            # Avatares
├── calendar.php            # Calendário de eventos
├── chat.php                # Chat
├── course.php              # Visualização de curso
├── dashboard.php           # Dashboard principal
├── gamification.php        # Gamificação
├── index.php               # Página inicial
├── login.php               # Login
├── logout.php              # Logout
├── profile.php             # Perfil do usuário
├── project.php             # Visualização de projeto
├── projects.php            # Lista de projetos
├── register.php            # Registro
├── training.php            # Treinamentos/Cursos
└── users.php               # Gerenciamento de usuários (admin)
```

## Funcionalidades

- **Autenticação**: Login, registro, recuperação de senha
- **Dashboard**: Visão geral com métricas e atividades
- **Treinamentos**: Cursos com lições, progresso e XP
- **Projetos**: Gerenciamento de projetos com quadro Kanban
- **Calendário**: Eventos e compromissos
- **Chat**: Comunicação em tempo real por canais
- **Gamificação**: Sistema de XP, níveis e conquistas
- **Perfil**: Edição de perfil e alteração de senha
- **Admin**: Gerenciamento de usuários (apenas administradores)

## Tecnologias

- PHP 8.x (puro, sem framework)
- PostgreSQL
- Tailwind CSS (via CDN)
- Lucide Icons
- Alpine.js (para interatividade)

## Segurança

- Senhas hasheadas com bcrypt
- Proteção CSRF
- Sanitização de inputs
- Prepared statements (PDO)
- Headers de segurança

## Licença

MIT License
