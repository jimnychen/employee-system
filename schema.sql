 
 DROP DATABASE IF EXISTS employee_system
-- PostgreSQL schema for attendance system used by this project

CREATE TABLE users (
    id serial PRIMARY KEY,
    username varchar(100) NOT NULL UNIQUE,
    password varchar(200) NOT NULL,
    name varchar(100),
    role varchar(20) NOT NULL DEFAULT 'employee',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_records (
    id serial PRIMARY KEY,
    employee_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in_time timestamptz NOT NULL,
    clock_out_time timestamptz,
    status varchar(10) NOT NULL DEFAULT 'IN' CHECK (status IN ('IN', 'OUT', 'PENDING')),
    record_date date GENERATED ALWAYS AS ((clock_in_time AT TIME ZONE 'Asia/Taipei')::date ) STORED,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (employee_id, record_date)
);

CREATE TABLE requests (
    id serial PRIMARY KEY,
    employee_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type varchar(20) NOT NULL CHECK (request_type IN ('leave', 'overtime')),
    leave_type varchar(50),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    reason text,
    manager_id integer REFERENCES users(id) ON DELETE SET NULL,
    status varchar(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    review_comment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_manager_status ON requests(manager_id, status);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, record_date);
