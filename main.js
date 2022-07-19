const core = require("@actions/core");
const fs = require("fs").promises;

const settings = ["outputFilePath", "variables"/*, "secrets"*/].reduce((obj, key) => {
	obj[key] = core.getInput(key);
	return obj;
}, {});

(async () => {
	const outputFile = await fs.readFile(settings.outputFilePath, "utf8");
	const outputJSON = JSON.parse(outputFile);

	settings.variables.forEach((variable) => {
		const value = outputJSON[variable].value;
		core.setOutput(variable, value);
	});

	await fs.unlink(settings.outputFilePath);
})();
