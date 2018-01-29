const mysql = require('mysql');
const inquirer = require("inquirer");

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,

	user: 'root',
	password: '',

	database: 'bamazon'
});

connection.query('SELECT * FROM products', (err, rows) => {
	if (err) throw err;
		console.log('connected!');
		console.log(rows);
		purchaseItem();
});

// validateInput forces positive inputs
function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a positive number.';
	}
}

function purchaseItem(){
	inquirer
		.prompt([{
			type: 'input',
			name: 'item_id',
			message: "What is the ID of the product you would like to buy?",
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quanity',
			message: 'How many do you need?',
			validate: validateInput,
			filter: Number
		}

		])
		.then(function(input) {
		

		var item = input.item_id;
		var quanity = input.quanity;

		// Query the db to confirm item ID has the desired quanity
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				displayInventory();

			} else {
				var productData = data[0];

				// console.log('productData = ' + JSON.stringify(productData));
				// console.log('productData.stock_quanity = ' + productData.stock_quanity);

				// If the quanity requested by the user is in stock
				if (quanity <= productData.stock_quanity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!');

					// Construct the updating query string
					var updateQueryStr = 'UPDATE products SET stock_quanity = ' + (productData.stock_quanity - quanity) + ' WHERE item_id = ' + item;
					// console.log('updateQueryStr = ' + updateQueryStr);

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your order has been placed! Your total is $' + productData.price * quanity);
						console.log('Thank you for shopping with us!');
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
					})
				} else {
					console.log('Sorry, there is not enough product in stock.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}

// displayInventory will retrieve the current inventory from the database and output it to the console
function displayInventory() {
	// console.log('___ENTER displayInventory___');

	// Construct the db query string
	queryStr = 'SELECT * FROM products';

	// Make the db query
	connection.query(queryStr, function(err, data) {
		if (err) throw err;

		console.log('Existing Inventory: ');
		console.log('...................');

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'ID: ' + data[i].item_id + ' // ';
			strOut += 'Name: ' + data[i].product_name + ' // ';
			strOut += 'Department: ' + data[i].department_name + ' // ';
			strOut += 'Price:' + data[i].price + ' // ';
			strOut += 'In Stock:' + data[i].stock_quanity;

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	//Prompt the user for item/quanity they would like to purchase
	  	purchaseItem();
	})
}

// runBamazon will execute the main application logic
function runBamazon() {
	// console.log('___ENTER runBamazon___');

	// Display the available inventory
	displayInventory();
}

// Run
runBamazon();