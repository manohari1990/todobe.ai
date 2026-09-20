-- AS updated_at COLUMN IS NOT REFRESHED WHILE EXISTING ROW IS CHANGED, WRITTEN A TRIGGER METHOD TO HANDLE IT.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN 
	IF NEW IS DISTINCT FROM OLD THEN
		NEW.updated_at = CURRENT_TIMESTAMP;
	END IF;
	RETURN NEW;
	
END;
$$ LANGUAGE plpgsql;
----------------------------------------------------------------------------------------------------------------------------

-- USER TODOS TABLE DEFINITION
CREATE TYPE priority_level AS enum('low', 'medium', 'high');
CREATE TYPE status_type AS enum('completed', 'in_progress', 'pending');

CREATE TABLE IF NOT EXISTS user_todos (
	todo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	title TEXT NOT NULL,
	details TEXT NOT NULL,
	priority priority_level DEFAULT 'medium',
	status status_type NOT NULL DEFAULT 'pending',
	due_date DATE,
	created_at TIMESTAMPTZ DEFAULT current_timestamp,
	updated_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- USERS TABLE DEFINITION
CREATE TYPE user_statuses AS enum('active', 'inactive', 'pending_activation', 'suspended', 'temp_inactive');

CREATE TABLE IF NOT EXISTS users(
	user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	username VARCHAR(255) UNIQUE,
	email VARCHAR(255) UNIQUE,
	phone VARCHAR(20),
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255),
	password_hash TEXT,
	profile_image TEXT,
	reset_password_key TEXT,
	user_status user_statuses NOT NULL DEFAULT 'active',
	created_at TIMESTAMPTZ DEFAULT current_timestamp,
	updated_at TIMESTAMPTZ DEFAULT current_timestamp
); 

CREATE TABLE IF NOT EXISTS user_password_reset_tokens(
	reset_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
	token_hash TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	used_at TIMESTAMPTZ NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp
)


ALTER TABLE user_todos 
ADD COLUMN user_id UUID,
ADD CONSTRAINT fk_todos_user
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE;

-- ATTACH THE TRIGGER TO THE "TODOS" TABLE SO THAT IT WILL RUN BEFORE EVERY CHANGED RECORD
CREATE TRIGGER update_timestamp
BEFORE UPDATE ON user_todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

----------------------------------------------------------------------------------------------------------------------------


CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

----------------------------------------------------------------------------------------------------------------------------

-- USER SESSIONS TABLE DEFINITION
CREATE TABLE IF NOT EXISTS user_sessions(
	session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	device_type VARCHAR(50),
	ip_address INET NOT NULL,
	user_agent TEXT,
	operating_system VARCHAR(100),
	browser VARCHAR(100),
	expires_at TIMESTAMPTZ NOT NULL,
	revoked_at TIMESTAMPTZ,
	refresh_token_hash TEXT,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ
);

ALTER TABLE user_sessions 
ADD COLUMN user_id UUID NOT NULL,
ADD CONSTRAINT fk_sessions_user
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE;


-- FUNCTION TO SET EXPIRES_AT TIME
CREATE OR REPLACE FUNCTION set_expires_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.expires_at := NOW() + INTERVAL '720 hours';
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- CREATE TRIGGER ON RECORD INSERT OR UPDATE
CREATE TRIGGER add_expires_at_trigger
BEFORE INSERT ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION set_expires_at_timestamp();


-- Create the index for the foreign key user_id in user_sessions
CREATE INDEX idx_sessions_user_id
ON user_sessions(user_id);
-- Create the index for the foreign key refresh_token_hash in user_sessions
CREATE UNIQUE INDEX idx_sessions_refresh_token_hash
ON user_sessions(refresh_token_hash);
