const core = require("@actions/core");
const fs = require("fs").promises;
const execCmd = require("child_process").exec;

const settings = ["outputFilePath", "variables", "secrets"].reduce((obj, key) => {
	obj[key] = core.getInput(key);
	return obj;
}, {});

(async () => {
	const outputFile = await fs.readFile(settings.outputFilePath, "utf8");
	const outputJSON = JSON.parse(outputFile);

	settings.variables.split(",").forEach((variable) => {
		const value = outputJSON[variable].value;
		core.setOutput(variable, value);
	});

	await Promise.all(settings.secrets.split(",").map(async (variable) => {
		const encryptedValue = outputJSON[variable].value;
		const value = await exec(`echo ${encryptedValue} | base64 --decode | gpg -d -q`);

		core.setSecret(value);
		core.setOutput(variable, value);
	}));

	await fs.unlink(settings.outputFilePath);
})();

function exec(cmd) {
	return new Promise((resolve, reject) => {
		execCmd(cmd, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}
