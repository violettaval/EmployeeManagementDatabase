const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employees"
});

connection.connect(function(err) {
    if (err) throw err;
    runSearch();
});

connection.query = util.promisify(connection.query);
function runSearch() {
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
                "Update employee roles"
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
            }
        });
}
  