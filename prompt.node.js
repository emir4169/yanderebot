var readline = require("readline");
var input = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function prompt (callback, pro) {
	input.question((typeof pro === "string" ? pro : ">"), function (str) {
	callback(str);
	return prompt(callback, pro);
	});
}

module.exports = prompt;
