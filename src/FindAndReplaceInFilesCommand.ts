import path = require("path");
import type { ExtensionContext } from "vscode";
import { FileType, Uri, commands, workspace } from "vscode";

async function getFilesToInclude (selectedFiles: Uri[]) {
	const filesToInclude = await Promise.all(selectedFiles.map(async file => {
		const stat = await Promise.resolve(workspace.fs.stat(file)).catch(() => undefined);
		if (stat?.type === FileType.Directory)
			file = Uri.joinPath(file, "**/*");

		const workspaceFolder = workspace.getWorkspaceFolder(file)?.uri.path ?? "/";
		const filePath = path.relative(workspaceFolder, file.path);
		return filePath[0] === "." || filePath[0] === "/" || filePath[0] === "\\" ? filePath : `./${filePath}`;
	}));

	return filesToInclude.join(", ").replace(/\\/g, "/");
}

async function FindInFilesCommand (file: Uri, selectedFiles: Uri[]) {
	await commands.executeCommand("workbench.action.findInFiles", {
		query: "",
		triggerSearch: false,
		filesToInclude: await getFilesToInclude(selectedFiles),
	});
}

async function ReplaceInFilesCommand (file: Uri, selectedFiles: Uri[]) {
	await commands.executeCommand("workbench.action.findInFiles", {
		query: "",
		replace: "",
		triggerSearch: false,
		filesToInclude: await getFilesToInclude(selectedFiles),
	});
}

namespace FindAndReplaceInFilesCommands {
	export function register (context: ExtensionContext) {
		context.subscriptions.push(commands
			.registerCommand("view-directory-as-file.findInFiles", FindInFilesCommand));
		context.subscriptions.push(commands
			.registerCommand("view-directory-as-file.replaceInFiles", ReplaceInFilesCommand));
	}
}

export default FindAndReplaceInFilesCommands;
