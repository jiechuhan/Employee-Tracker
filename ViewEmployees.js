var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Wazy0129",
    database: "employees_db"
})

connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});

function query(sql, args) {
    return new Promise((res, rej) => {
        connection.query(sql, args, (err, rows) => {
            if (err)
                return rej(err);
            res(rows)
        })
    })
}

async function getDep() {
    try {
        return query("SELECT department as name, id as value FROM department");
    } catch (error) {
        console.log('error', error);
    };
};

async function getRole() {
    try {
        return query("SELECT title as name, id as value FROM roles");
    } catch (error) {
        console.log('error', error);
    };
};

async function getManager() {
    try {
        return query("SELECT DISTINCT CONCAT(E1.first_name, ' ', E1.last_name) as name, E1.id as value FROM employee E1 INNER JOIN employee E2 ON E1.id = E2.manager_id");
    } catch (error) {
        console.log('error', error);
    };
};

async function getEm() {
    try {
        return query("SELECT DISTINCT CONCAT(E.first_name, ' ', E.last_name) as name, E.id as value FROM employee E");
    } catch (error) {
        console.log('error', error);
    };
};


function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all employees by department",
                "View all employees by manager",
                "Add employee",
                "Remove employee",
                "Update employee role",
                "Update employee manager",
                "View all roles",
                "Add role",
                "Remove role",
                "View all departments",
                "Add department",
                "Remove department",
                "Quit"
            ]
        })
        .then(async function (answer) {
            switch (answer.action) {
                case "View all employees":
                    connection.query("SELECT E1.first_name, E1.last_name, R.title, D.department, R.salary, CONCAT(E2.first_name, ' ', E2.last_name) as 'manager' FROM employee E1 LEFT JOIN roles R ON E1.role_id = R.id LEFT JOIN department D ON R.department_id = D.id LEFT JOIN employee E2 ON E2.id = E1.manager_id;", function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        runSearch();
                    });
                    break;

                case "View all employees by department":
                    let dep = await getDep()
                    inquirer
                        .prompt([{
                            name: "department",
                            type: "rawlist",
                            message: "Which department would you like to see employees for?",
                            choices: dep
                        }]).then(function (answer) {
                            connection.query("SELECT E.first_name, E.last_name, R.title FROM employee E LEFT JOIN roles R ON E.role_id = R.id LEFT JOIN department D ON R.department_id = D.id WHERE D.id = ?", [answer.department], function (err, res) {
                                if (err) throw err;
                                console.table(res)
                                runSearch()
                            });
                        });
                    break;

                case "View all employees by manager":
                    let manager = await getManager()
                    inquirer
                        .prompt([{
                            name: "manager",
                            type: "rawlist",
                            message: "Which employee do you want to see direct reports for?",
                            choices: manager
                        }]).then(function (answer) {
                            var sql = "SELECT E1.first_name, E1.last_name, D.department, R.title FROM employee E1 LEFT JOIN roles R ON E1.role_id = R.id LEFT JOIN department D ON R.department_id = D.id LEFT JOIN employee E2 ON E2.id = E1.manager_id WHERE E2.id = ?"
                            var values = answer.manager
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.table(res)
                                runSearch()
                            });
                        });
                    break;

                case "Add employee":
                    let role = await getRole();
                    let man = await getEm();
                    inquirer
                        .prompt([{
                            name: "firstName",
                            type: "input",
                            message: "What is the employee's first name?",
                            validate: function (value) {
                                if (value) { return true }
                                else { return "Please enter a valide name" }
                            }
                        }, {
                            name: "lastName",
                            type: "input",
                            message: "What is the employee's last name?",
                            validate: function (value) {
                                if (value) { return true }
                                else { return "Please enter a valide name" }
                            }
                        }, {
                            name: "role",
                            type: "rawlist",
                            message: "What is the employee's role?",
                            choices: role
                        }, {
                            name: "manager",
                            type: "rawlist",
                            message: "Who is the employee's manager?",
                            choices: man
                        }
                        ])
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ?"
                            var values = [[answer.firstName, answer.lastName, answer.role, answer.manager]];
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.table(`Added ${answer.firstName} ${answer.lastName} to the database`)
                                runSearch()
                            });
                        })
                    break;

                case "Remove employee":
                    let employee = await getEm();
                    console.log(employee)
                    inquirer
                        .prompt({
                            name: "fullName",
                            type: "rawlist",
                            message: "Which employee do you want to remove?",
                            choices: employee
                        })
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "DELETE FROM employee WHERE id = ?"
                            var values = [answer.fullName]
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.log(`Removed employee from the database`)
                                runSearch()
                            })
                        })
                    break;

                case "Update employee role":
                    let emp = await getEm();
                    let roles = await getRole();
                    inquirer
                        .prompt([{
                            name: "employee",
                            type: "rawlist",
                            message: "Which employee's role do you want to update?",
                            choices: emp
                        }, {
                            name: "role",
                            type: "rawlist",
                            message: "Which role do you want to assign the selected employee?",
                            choices: roles
                        }
                        ])
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "UPDATE employee SET role_id = ? WHERE id = ?"
                            var values = [answer.role, answer.employee]
                            connection.query(sql, values, function (err, res) {
                                if (err) throw err;
                                console.log("updated employee's role");
                                runSearch();
                            });
                        });
                    break;

                case "Update employee manager":
                    let manName = await getManager();
                    let employ = await getEm();
                    inquirer
                        .prompt([{
                            name: "employee",
                            type: "rawlist",
                            message: "Which employee's manager do you want to update?",
                            choices: employ
                        }, {
                            name: "manager",
                            type: "rawlist",
                            message: "Which employee do you want to set as manager for the selected employee?",
                            choices: employ
                        }
                        ])
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "UPDATE employee SET manager_id = ? WHERE id = ?"
                            var values = [answer.manager, answer.employee]
                            connection.query(sql, values, function (err, res) {
                                if (err) throw err;
                                console.log("updated employee's role");
                                runSearch();
                            });
                        });
                    break;

                case "View all roles":
                    connection.query("SELECT R.title, D.department, R.salary FROM roles R LEFT JOIN department D ON R.department_id = D.id", function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        runSearch();
                    });
                    break;

                case "Add role":
                    let department = await getDep();
                    inquirer
                        .prompt([{
                            name: "addRole",
                            type: "input",
                            message: "What is the name of the role?",
                            validate: function (value) {
                                if (value) { return true }
                                else { return "Please enter a valide role" }
                            }
                        }, {
                            name: "salary",
                            type: "input",
                            message: "What is the salary of the role?",
                            validate: function (value) {
                                if (value) { return true }
                                else { return "Please enter a valide salary" }
                            }
                        }, {
                            name: "dep",
                            type: "rawlist",
                            message: "Which department does the role belong to?",
                            choices: department
                        }
                        ])
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "INSERT INTO roles (title, salary, department_id) VALUES ?"
                            var values = [[answer.addRole, answer.salary, answer.dep]];
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                connection.query("SELECT title, department, salary FROM roles LEFT JOIN department ON department.id = roles.department_id")
                                console.table(`Added ${answer.addRole} to the database`)
                                runSearch()
                            });
                        })
                    break;

                case "Remove role":
                    let rol = await getRole();
                    console.log(rol)
                    inquirer
                        .prompt({
                            name: "roleName",
                            type: "rawlist",
                            message: "Which role do you want to remove? (Warning: This will also remove employees)",
                            choices: rol
                        })
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "DELETE FROM roles WHERE id = ?"
                            var values = [[answer.roleName]]
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.log(`Removed role from the database`)
                                runSearch()
                            })
                        })
                    break;

                case "View all departments":
                    connection.query("SELECT D.department AS name, SUM(R.salary) AS utilized_budget FROM roles R INNER JOIN department D ON R.department_id = D.id INNER JOIN employee E ON R.id = E.role_id GROUP BY D.department", function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        runSearch();
                    });
                    break;

                case "Add department":
                    inquirer
                        .prompt([{
                            name: "addDep",
                            type: "input",
                            message: "What is the name of the department?",
                            validate: function (value) {
                                if (value) { return true }
                                else { return "Please enter a valide role" }
                            }
                        }
                        ])
                        .then(function (answer) {
                            console.log(answer.addDep)
                            var sql = "INSERT INTO department (department) VALUES ?"
                            var values = [[answer.addDep]];
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.table(`Added ${answer.addDep} to the database`)
                                runSearch()
                            });
                        });
                    break;

                case "Remove department":
                    let depa = await getDep();
                    inquirer
                        .prompt({
                            name: "depName",
                            type: "rawlist",
                            message: "Which department do you want to remove? (Warning: This will also remove associated roles and employees)",
                            choices: depa
                        })
                        .then(function (answer) {
                            console.log(answer)
                            var sql = "DELETE FROM department WHERE id = ?"
                            var values = [[answer.depName]]
                            connection.query(sql, [values], function (err, res) {
                                if (err) throw err;
                                console.log(`Removed department from the database`)
                                runSearch()
                            })
                        })
                    break;

                case "Quit":
                    break;
            };
        });
};