use role_management_db;
use employee;
INSERT INTO department
    (name)
VALUES
    ('Sales'),
    ('Finance'),
    ('Legal');
INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Legal Team Lead', 250000, 2),
    ('Lawyer', 190000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3);
INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Monique', 'Cat', 1, NULL),
    ('Roscoe', 'Horse', 2, 1),
    ('Cherve', 'Goat', 3, NULL),
    ('Cookie', 'Dog', 4, 3),
    ('Tipper', 'Cow', 5, NULL),
    ('Benjamin', 'Puppy', 6, 5);
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;
SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;