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
        .then(function (answer) {
            switch (answer.action) {
                case "View all employees":
                    viewAll();
                    break;

                case "View all employees by department":
                    viewEbyDep();
                    break;

                // case "View all employees by manager":
                //     rangeSearch();
                //     break;

                // case "Add employee":
                //     songSearch();
                //     break;

                // case "Remove employee":
                //     songAndAlbumSearch();
                //     break;

                // case "Update employee role":
                //     songAndAlbumSearch();
                //     break;

                // case "Update employee manager":
                //     songAndAlbumSearch();
                //     break;

                // case "View all roles":
                //     songAndAlbumSearch();
                //     break;

                // case "Add role":
                //     songAndAlbumSearch();
                //     break;

                // case "Remove role":
                //     songAndAlbumSearch();
                //     break;

                // case "View all departments":
                //     songAndAlbumSearch();
                //     break;

                // case "Add department":
                //     songAndAlbumSearch();
                //     break;

                // case "Remove department":
                //     songAndAlbumSearch();
                //     break;

                // case "Quit":
                //     break;
            }
        })
}

function viewAll() {
    connection.query("SELECT E.first_name, E.last_name, R.title, D.name, R.salary FROM  employee E INNER JOIN roles R ON E.role_id = R.id INNER JOIN department D ON R.department_id = D.id;", function(err, res) {
        if (err) throw err;
        console.table(res);
        runSearch();
    });
};

function viewEbyDep() {
    inquirer
        .prompt([{
            name: "department",
            type: "rawlist",
            message: "Which department would you like to see employees for?",
            choices: [
                "Marketing",
                "Finance",
            ]
        }
    ])
    .then(function(answer) {
        connection.query("SELECT E.first_name, E.last_name, R.title, FROM  employee E INNER JOIN roles R ON E.role_id = R.id INNER JOIN department D ON R.department_id = D.id;", function(err, res) {
            if (err) throw err;
            console.table(res)
        });
    })

};