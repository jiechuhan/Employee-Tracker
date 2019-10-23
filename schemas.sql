DROP DATABASE IF EXISTS employees_db;
CREATE database employees_db;

USE employees_db;

CREATE TABLE department (
  id INTEGER auto_increment NOT NULL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
   id INTEGER auto_increment NOT NULL,
   title VARCHAR(30) NOT NULL,
   salary DECIMAL (10,2) NULL,
   department_id INTEGER NULL,
   PRIMARY KEY (id)
);

CREATE TABLE employee (
   id INTEGER auto_increment NOT NULL,
   first_name VARCHAR(30) NOT NULL,
   last_name VARCHAR(30) NOT NULL,
   role_id INTEGER NULL,
   manager_id INTEGER NULL,
   PRIMARY KEY (id)
);

INSERT INTO department (name)
VALUES ("Marketing"), ("Finance");

INSERT INTO roles (title, salary, department_id)
VALUES ("Engineer", 100000, 2), ("Sales", 40000, 1), ("Lawyer", 100000, 1), ("Lead Eng", 200000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Hanna", "Lauth", 1, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Jane", "Smith", 2), ("John", "Smith", 2), ("Zane", "Thomas", 4);