-- Maternar Santamariense - Database Schema (PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MANAGER')),
    department VARCHAR(100),
    position VARCHAR(200),
    avatar VARCHAR(500),
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    weekly_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    category VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'BEGINNER' CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    xp_reward INTEGER DEFAULT 100,
    estimated_time INTEGER DEFAULT 60, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    order_num INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Lesson progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    start_date DATE,
    due_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    type VARCHAR(50) DEFAULT 'MEETING' CHECK (type IN ('MEETING', 'TRAINING', 'APPOINTMENT', 'DEADLINE', 'OTHER')),
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT false,
    organizer_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE')),
    UNIQUE(event_id, user_id)
);

-- Chat channels
CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(20) DEFAULT 'PUBLIC' CHECK (type IN ('PUBLIC', 'PRIVATE', 'DIRECT')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Channel members
CREATE TABLE IF NOT EXISTS channel_members (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM')),
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    xp_reward INTEGER DEFAULT 100,
    type VARCHAR(50) DEFAULT 'GENERAL',
    condition_type VARCHAR(50),
    condition_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    requires_acknowledgment BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy reads
CREATE TABLE IF NOT EXISTS policy_reads (
    id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT false,
    UNIQUE(policy_id, user_id)
);

-- Links table (useful links)
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password, first_name, last_name, role, department, position, total_xp, level)
VALUES (
    'admin@maternarsantamariense.com',
    'laurapellegrin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'Laura',
    'Pellegrin',
    'ADMIN',
    'Enfermagem',
    'Acadêmica de Enfermagem | Bolsista PROBIC',
    5000,
    6
) ON CONFLICT (email) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (title, description, icon, xp_reward, type, condition_type, condition_value) VALUES
('Primeiros Passos', 'Complete seu primeiro curso', 'trophy', 100, 'COURSE_COMPLETION', 'courses_completed', 1),
('Estudante Dedicado', 'Complete 5 cursos', 'book-open', 250, 'COURSE_COMPLETION', 'courses_completed', 5),
('Mestre do Conhecimento', 'Complete 10 cursos', 'graduation-cap', 500, 'COURSE_COMPLETION', 'courses_completed', 10),
('Colaborador', 'Participe de 5 projetos', 'users', 200, 'PROJECT_PARTICIPATION', 'projects_joined', 5),
('Sequência de 7 dias', 'Acesse o sistema por 7 dias consecutivos', 'flame', 150, 'LOGIN_STREAK', 'streak_days', 7),
('Sequência de 30 dias', 'Acesse o sistema por 30 dias consecutivos', 'fire', 500, 'LOGIN_STREAK', 'streak_days', 30)
ON CONFLICT DO NOTHING;

-- Insert default channel
INSERT INTO channels (name, description, type, created_by)
VALUES ('Geral', 'Canal geral para discussões', 'PUBLIC', 1)
ON CONFLICT DO NOTHING;
