/*
Assumptions:
1. service_regions is stored as a comma-separated VARCHAR value because no separate region entity was specified.
2. A lead can convert to at most one client, and converted leads must have both converted_client_id and converted_at.
3. quotation.amount stores the agreed quotation total and should match the package breakdown.
*/

CREATE DATABASE IF NOT EXISTS crm_project_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE crm_project_management;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS quotation_packages;
DROP TABLE IF EXISTS follow_ups;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS website_packages;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Core tables

CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manager_id INT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE clients (
    client_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    service_regions VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    billing_street VARCHAR(150) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_zip VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_clients_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE website_packages (
    package_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    duration_days INT UNSIGNED NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_website_packages_name UNIQUE (package_name),
    CONSTRAINT chk_website_packages_duration CHECK (duration_days > 0),
    CONSTRAINT chk_website_packages_price CHECK (price > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE leads (
    lead_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assigned_user_id INT UNSIGNED NOT NULL,
    converted_client_id INT UNSIGNED NULL,
    source VARCHAR(100) NOT NULL,
    website_type_needed VARCHAR(100) NOT NULL,
    budget DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    converted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_leads_budget CHECK (budget >= 0),
    CONSTRAINT chk_leads_status CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE interactions (
    interaction_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    interaction_datetime DATETIME NOT NULL,
    notes TEXT NOT NULL,
    interaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_interactions_type CHECK (interaction_type IN ('call', 'email', 'meeting', 'message', 'other'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE quotations (
    quotation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sent_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_quotations_amount CHECK (amount >= 0),
    CONSTRAINT chk_quotations_status CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE projects (
    project_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    duration_days INT GENERATED ALWAYS AS (DATEDIFF(deadline, start_date)) STORED,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_projects_dates CHECK (deadline >= start_date),
    CONSTRAINT chk_projects_status CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE invoices (
    invoice_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_invoices_amount CHECK (amount >= 0),
    CONSTRAINT chk_invoices_status CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE follow_ups (
    interaction_id INT UNSIGNED NOT NULL,
    followup_id INT UNSIGNED NOT NULL,
    log_date DATETIME NOT NULL,
    log_notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (interaction_id, followup_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tasks (
    project_id INT UNSIGNED NOT NULL,
    task_id INT UNSIGNED NOT NULL,
    task_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, task_id),
    CONSTRAINT chk_tasks_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE quotation_packages (
    quotation_id INT UNSIGNED NOT NULL,
    package_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    agreed_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (quotation_id, package_id),
    CONSTRAINT chk_quotation_packages_quantity CHECK (quantity > 0),
    CONSTRAINT chk_quotation_packages_price CHECK (agreed_price >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Foreign keys

ALTER TABLE users
    ADD CONSTRAINT fk_users_manager
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE leads
    ADD CONSTRAINT fk_leads_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_leads_converted_client
    FOREIGN KEY (converted_client_id) REFERENCES clients(client_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE interactions
    ADD CONSTRAINT fk_interactions_client
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE quotations
    ADD CONSTRAINT fk_quotations_client
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_client
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE follow_ups
    ADD CONSTRAINT fk_follow_ups_interaction
    FOREIGN KEY (interaction_id) REFERENCES interactions(interaction_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE quotation_packages
    ADD CONSTRAINT fk_quotation_packages_quotation
    FOREIGN KEY (quotation_id) REFERENCES quotations(quotation_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_quotation_packages_package
    FOREIGN KEY (package_id) REFERENCES website_packages(package_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Triggers

DELIMITER $$

CREATE TRIGGER trg_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.manager_id IS NOT NULL AND NEW.manager_id = NEW.user_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A user cannot be their own manager';
    END IF;
END$$

CREATE TRIGGER trg_users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.manager_id IS NOT NULL AND NEW.manager_id = NEW.user_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A user cannot be their own manager';
    END IF;
END$$

CREATE TRIGGER trg_leads_before_insert
BEFORE INSERT ON leads
FOR EACH ROW
BEGIN
    IF (
        (NEW.status = 'converted' AND (NEW.converted_client_id IS NULL OR NEW.converted_at IS NULL))
        OR
        (NEW.status <> 'converted' AND (NEW.converted_client_id IS NOT NULL OR NEW.converted_at IS NOT NULL))
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Converted leads require client and timestamp values';
    END IF;
END$$

CREATE TRIGGER trg_leads_before_update
BEFORE UPDATE ON leads
FOR EACH ROW
BEGIN
    IF (
        (NEW.status = 'converted' AND (NEW.converted_client_id IS NULL OR NEW.converted_at IS NULL))
        OR
        (NEW.status <> 'converted' AND (NEW.converted_client_id IS NOT NULL OR NEW.converted_at IS NOT NULL))
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Converted leads require client and timestamp values';
    END IF;
END$$

DELIMITER ;

-- Indexes

CREATE INDEX idx_users_manager_id ON users (manager_id);

CREATE INDEX idx_leads_assigned_user_id ON leads (assigned_user_id);
CREATE INDEX idx_leads_converted_client_id ON leads (converted_client_id);
CREATE INDEX idx_leads_status ON leads (status);

CREATE INDEX idx_clients_business_name ON clients (business_name);

CREATE INDEX idx_interactions_client_id ON interactions (client_id);
CREATE INDEX idx_interactions_datetime ON interactions (interaction_datetime);
CREATE INDEX idx_interactions_type ON interactions (interaction_type);

CREATE INDEX idx_quotations_client_id ON quotations (client_id);
CREATE INDEX idx_quotations_status ON quotations (status);
CREATE INDEX idx_quotations_sent_date ON quotations (sent_date);

CREATE INDEX idx_projects_client_id ON projects (client_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_start_date ON projects (start_date);

CREATE INDEX idx_invoices_project_id ON invoices (project_id);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);
CREATE INDEX idx_invoices_payment_status ON invoices (payment_status);

CREATE INDEX idx_follow_ups_log_date ON follow_ups (log_date);

CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);

CREATE INDEX idx_quotation_packages_package_id ON quotation_packages (package_id);

-- Sample data

INSERT INTO users (manager_id, name, email, password_hash, role, username) VALUES
    (NULL, 'Alice Perera', 'alice@orbitcrm.com', '$2y$12$XQeJ4v4T8Ui6JpYSh3oK3e6K7EY1y1WmD6G0fQ8Hqv4hHq6MlV3vS', 'sales_manager', 'alice.perera'),
    (1, 'Nimal Fernando', 'nimal@orbitcrm.com', '$2y$12$HgYf2M0t9Kj8WnBq7rP1Qe6wM8P3bN2sF1qR4vY8cK2hL5mD9sT2u', 'sales_exec', 'nimal.fernando'),
    (1, 'Sana Wijesinghe', 'sana@orbitcrm.com', '$2y$12$Aq2Bv7Dp8tR4mN1jK9sP3e6vY5gH2fL8wC7nT4xQ1uM6pR9zB3dEw', 'project_manager', 'sana.wijesinghe');

INSERT INTO clients (
    business_name,
    contact_person,
    industry,
    service_regions,
    phone,
    email,
    billing_street,
    billing_city,
    billing_zip
) VALUES
    ('Bluewave Logistics', 'Anika Silva', 'Logistics', 'Colombo,Gampaha,Kandy', '+94-77-123-4567', 'anika@bluewave.lk', '45 Marine Drive', 'Colombo', '00300'),
    ('Northstar Dental', 'Dr. Ravi Senanayake', 'Healthcare', 'Colombo,Negombo', '+94-71-555-7788', 'ravi@northstardental.lk', '18 Temple Road', 'Negombo', '11500');

INSERT INTO website_packages (package_name, duration_days, price) VALUES
    ('Starter Site', 30, 1200.00),
    ('Business Growth Site', 45, 3000.00),
    ('Monthly Maintenance', 30, 300.00);

INSERT INTO leads (
    assigned_user_id,
    converted_client_id,
    source,
    website_type_needed,
    budget,
    status,
    converted_at
) VALUES
    (2, 1, 'Website Form', 'Corporate Website', 3500.00, 'converted', '2026-06-12 14:30:00'),
    (2, NULL, 'Referral', 'Dental Clinic Website', 2000.00, 'qualified', NULL),
    (1, 2, 'LinkedIn Outreach', 'Practice Website Redesign', 2200.00, 'converted', '2026-07-01 09:15:00');

INSERT INTO interactions (client_id, interaction_datetime, notes, interaction_type) VALUES
    (1, '2026-06-14 10:00:00', 'Kickoff call to confirm pages, branding, and the launch target.', 'call'),
    (2, '2026-07-02 15:30:00', 'Reviewed the quotation and requested an added gallery section.', 'meeting');

INSERT INTO quotations (client_id, amount, status, sent_date) VALUES
    (1, 3300.00, 'accepted', '2026-06-10'),
    (2, 1800.00, 'sent', '2026-07-01');

INSERT INTO projects (client_id, project_name, start_date, deadline, status) VALUES
    (1, 'Bluewave Corporate Site', '2026-06-15', '2026-09-30', 'active'),
    (2, 'Northstar Clinic Website', '2026-02-15', '2026-05-30', 'completed');

INSERT INTO invoices (project_id, amount, due_date, payment_status) VALUES
    (1, 1500.00, '2026-07-10', 'unpaid'),
    (2, 1800.00, '2026-05-20', 'paid');

INSERT INTO follow_ups (interaction_id, followup_id, log_date, log_notes) VALUES
    (1, 1, '2026-06-15 09:00:00', 'Sent a recap email with the sitemap and content checklist.'),
    (1, 2, '2026-06-18 11:00:00', 'Received the logo files and approved the homepage direction.'),
    (2, 1, '2026-07-03 10:00:00', 'Updated the quotation after adding the gallery requirement.');

INSERT INTO tasks (project_id, task_id, task_name, status, priority) VALUES
    (1, 1, 'Finalize sitemap', 'completed', 'medium'),
    (1, 2, 'Build homepage UI', 'in_progress', 'high'),
    (2, 1, 'Publish service pages', 'completed', 'medium'),
    (2, 2, 'Configure appointment form', 'completed', 'high');

INSERT INTO quotation_packages (quotation_id, package_id, quantity, agreed_price) VALUES
    (1, 2, 1, 3000.00),
    (1, 3, 1, 300.00),
    (2, 1, 1, 1200.00),
    (2, 3, 2, 300.00);

-- Views

CREATE OR REPLACE VIEW client_project_summary AS
SELECT
    c.client_id,
    c.business_name,
    p.project_id,
    p.project_name,
    p.start_date,
    p.deadline,
    p.duration_days,
    p.status AS project_status
FROM clients AS c
LEFT JOIN projects AS p
    ON p.client_id = c.client_id;

CREATE OR REPLACE VIEW quotation_total_summary AS
SELECT
    q.quotation_id,
    q.client_id,
    c.business_name,
    q.status AS quotation_status,
    q.sent_date,
    COALESCE(SUM(qp.quantity * qp.agreed_price), 0) AS calculated_total
FROM quotations AS q
JOIN clients AS c
    ON c.client_id = q.client_id
LEFT JOIN quotation_packages AS qp
    ON qp.quotation_id = q.quotation_id
GROUP BY
    q.quotation_id,
    q.client_id,
    c.business_name,
    q.status,
    q.sent_date;

CREATE OR REPLACE VIEW overdue_invoice_summary AS
SELECT
    i.invoice_id,
    i.project_id,
    p.project_name,
    c.client_id,
    c.business_name,
    i.amount,
    i.due_date,
    i.payment_status
FROM invoices AS i
JOIN projects AS p
    ON p.project_id = i.project_id
JOIN clients AS c
    ON c.client_id = p.client_id
WHERE i.due_date < CURDATE()
  AND i.payment_status NOT IN ('paid', 'cancelled');

CREATE OR REPLACE VIEW user_manager_summary AS
SELECT
    u.user_id,
    u.name AS user_name,
    u.username,
    u.role,
    m.user_id AS manager_id,
    m.name AS manager_name,
    m.username AS manager_username
FROM users AS u
LEFT JOIN users AS m
    ON m.user_id = u.manager_id;

-- Demonstration queries

-- 1. List all leads with their assigned users
SELECT
    l.lead_id,
    l.source,
    l.website_type_needed,
    l.status,
    u.user_id AS assigned_user_id,
    u.name AS assigned_user_name,
    u.username AS assigned_username
FROM leads AS l
JOIN users AS u
    ON u.user_id = l.assigned_user_id
ORDER BY l.lead_id;

-- 2. List converted leads with their corresponding clients
SELECT
    l.lead_id,
    l.source,
    l.converted_at,
    c.client_id,
    c.business_name,
    c.contact_person
FROM leads AS l
JOIN clients AS c
    ON c.client_id = l.converted_client_id
WHERE l.status = 'converted'
ORDER BY l.converted_at;

-- 3. List clients with their projects
SELECT
    c.client_id,
    c.business_name,
    p.project_id,
    p.project_name,
    p.status AS project_status
FROM clients AS c
LEFT JOIN projects AS p
    ON p.client_id = c.client_id
ORDER BY c.client_id, p.project_id;

-- 4. List quotations received by each client
SELECT
    c.client_id,
    c.business_name,
    q.quotation_id,
    q.amount,
    q.status,
    q.sent_date
FROM clients AS c
LEFT JOIN quotations AS q
    ON q.client_id = c.client_id
ORDER BY c.client_id, q.sent_date;

-- 5. Calculate the total value of each quotation using quantity and agreed_price
SELECT
    q.quotation_id,
    c.business_name,
    SUM(qp.quantity * qp.agreed_price) AS calculated_total
FROM quotations AS q
JOIN clients AS c
    ON c.client_id = q.client_id
JOIN quotation_packages AS qp
    ON qp.quotation_id = q.quotation_id
GROUP BY q.quotation_id, c.business_name
ORDER BY q.quotation_id;

-- 6. List website packages included in each quotation
SELECT
    q.quotation_id,
    c.business_name,
    wp.package_name,
    qp.quantity,
    qp.agreed_price
FROM quotations AS q
JOIN clients AS c
    ON c.client_id = q.client_id
JOIN quotation_packages AS qp
    ON qp.quotation_id = q.quotation_id
JOIN website_packages AS wp
    ON wp.package_id = qp.package_id
ORDER BY q.quotation_id, wp.package_name;

-- 7. List overdue invoices
SELECT
    i.invoice_id,
    p.project_name,
    c.business_name,
    i.amount,
    i.due_date,
    i.payment_status
FROM invoices AS i
JOIN projects AS p
    ON p.project_id = i.project_id
JOIN clients AS c
    ON c.client_id = p.client_id
WHERE i.due_date < CURDATE()
  AND i.payment_status NOT IN ('paid', 'cancelled')
ORDER BY i.due_date;

-- 8. List invoices with their related projects and clients
SELECT
    i.invoice_id,
    i.amount,
    i.due_date,
    i.payment_status,
    p.project_id,
    p.project_name,
    c.client_id,
    c.business_name
FROM invoices AS i
JOIN projects AS p
    ON p.project_id = i.project_id
JOIN clients AS c
    ON c.client_id = p.client_id
ORDER BY i.invoice_id;

-- 9. List all tasks for a selected project
SELECT
    t.project_id,
    p.project_name,
    t.task_id,
    t.task_name,
    t.status,
    t.priority
FROM tasks AS t
JOIN projects AS p
    ON p.project_id = t.project_id
WHERE t.project_id = 1
ORDER BY t.task_id;

-- 10. List client interactions with their follow-ups
SELECT
    c.business_name,
    i.interaction_id,
    i.interaction_datetime,
    i.interaction_type,
    f.followup_id,
    f.log_date,
    f.log_notes
FROM interactions AS i
JOIN clients AS c
    ON c.client_id = i.client_id
LEFT JOIN follow_ups AS f
    ON f.interaction_id = i.interaction_id
ORDER BY i.interaction_id, f.followup_id;

-- 11. List users together with their managers
SELECT
    u.user_id,
    u.name AS user_name,
    u.role,
    m.user_id AS manager_id,
    m.name AS manager_name
FROM users AS u
LEFT JOIN users AS m
    ON m.user_id = u.manager_id
ORDER BY u.user_id;

-- 12. Calculate the number of projects owned by each client
SELECT
    c.client_id,
    c.business_name,
    COUNT(p.project_id) AS total_projects
FROM clients AS c
LEFT JOIN projects AS p
    ON p.client_id = c.client_id
GROUP BY c.client_id, c.business_name
ORDER BY total_projects DESC, c.client_id;

-- 13. Calculate the total invoice amount for each project
SELECT
    p.project_id,
    p.project_name,
    COALESCE(SUM(i.amount), 0) AS total_invoice_amount
FROM projects AS p
LEFT JOIN invoices AS i
    ON i.project_id = p.project_id
GROUP BY p.project_id, p.project_name
ORDER BY p.project_id;

-- 14. Show active projects and their remaining days
SELECT
    p.project_id,
    p.project_name,
    c.business_name,
    p.deadline,
    DATEDIFF(p.deadline, CURDATE()) AS remaining_days
FROM projects AS p
JOIN clients AS c
    ON c.client_id = p.client_id
WHERE p.status = 'active'
ORDER BY p.deadline;

-- 15. Show leads that have not yet been converted
SELECT
    lead_id,
    source,
    website_type_needed,
    budget,
    status
FROM leads
WHERE converted_client_id IS NULL
ORDER BY lead_id;
