const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
require("console.table");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employees"
});

connection.connect(function(err) {
    if (err) throw err; 
    console.log("Welcome");
    run();
});

connection.query = util.promisify(connection.query);
function run() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "Add departments",
                "Add roles",
                "Add employees",
                "View departments",
                "View roles",
                "View employees",
                "Update employee roles",
                "Quit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add departments":
                    addDepartment();
                    break;

                case "Add roles":
                    addRole();
                    break;

                case "Add employees":
                    addEmployee();
                    break;

                case "View departments":
                    displayDepartment();
                    break;

                case "View roles":
                    displayRole();
                    break;

                case "View employees":
                    displayEmployee();
                    break;

                case "Update employee roles":
                    changeEmployee();
                    break;
                default:
                console.log("Goodbye!")
            }
        });
};

// Create a new department
async function addDepartment() {
    const department = await prompt([
      {
        name: "name",
        message: "What is the name of the department?"
      }
    ]);
    await connection.query("INSERT INTO department SET ?", department);
    console.log(`Added ${department.name} to the database`);
    run();
};

// Create a new role
async function addRole() {
    const departments = await connection.query("SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id GROUP BY department.id, department.name;");
    const departmentChoices = departments.map(({ id, name }) => ({
      name: name,
      value: id
    }));
    const role = await prompt([
      {
        name: "title",
        message: "What is the name of the role?"
      },
      {
        name: "salary",
        message: "What is the salary of the role?"
      },
      {
        type: "list",
        name: "department_id",
        message: "Which department does the role belong to?",
        choices: departmentChoices
      }
    ]);
    await connection.query("INSERT INTO role SET ?", role);
    console.log(`Added ${role.title} to the database`); 
    run();
};

// Create a new employee
async function addEmployee() {
    const roles = await connection.query("SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;");
    const employees = await connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;");
    const employee = await prompt([
      {
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        name: "last_name",
        message: "What is the employee's last name?"
      }
    ]);
    const roleChoices = roles.map(({ id, title }) => ({
      name: title,
      value: id
    }));
    const { roleId } = await prompt({
      type: "list",
      name: "roleId",
      message: "What is the employee's role?",
      choices: roleChoices
    });
    employee.role_id = roleId;
    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
    managerChoices.unshift({ name: "None", value: null });
    const { managerId } = await prompt({
      type: "list",
      name: "managerId",
      message: "Who is the employee's manager?",
      choices: managerChoices
    });
    employee.manager_id = managerId;
    await connection.query("INSERT INTO employee SET ?", employee);
    console.log(`Added ${employee.first_name} ${employee.last_name} to the database`);
    run();
};

// Find all departments, join with employees and roles and sum up utilized department budget
async function displayDepartment() {
    const departments = await connection.query("SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id GROUP BY department.id, department.name;");
    console.log("\n");
    console.table(departments);
    run();
};

// Find all roles, join with departments to display the department name
async function displayRoles() {
    const roles = await connection.query("SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;");
    console.log("\n");
    console.table(roles);
    run();
};

// Find all employees, join with roles and departments to display their roles, salaries, departments, and managers
async function displayEmployee() {
    const employees = await connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;");
    console.log("\n");
    console.table(employees);
    run();
};

// Update the given employee's role
async function changeEmployee() {
    const employees = await connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;");
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
    const { employeeId } = await prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee's role do you want to update?",
        choices: employeeChoices
      }
    ]);
    const roles = await connection.query("SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;");
    const roleChoices = roles.map(({ id, title }) => ({
      name: title,
      value: id
    }));
    const { roleId } = await prompt([
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to assign the selected employee?",
        choices: roleChoices
      }
    ]);
    await connection.query(
        "UPDATE employee SET role_id = ? WHERE id = ?",
        [roleId, employeeId]
    );
    console.log("Updated employee's role");
    run();
};
