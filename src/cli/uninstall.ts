import { KIT_FIRST_PATH } from "../core/utils.js"

let file = JSON.parse(
	await readFile(kenvPath("package.json"), {
		encoding: "utf8"
	})
)

let packageNames = (await arg(
	{
		placeholder: chalk`Which packages do you want to {red uninstall}`,
		enter: "Uninstall"
	},
	[
		...Object.keys(file?.dependencies || []),
		...Object.keys(file?.devDependencies || [])
	].filter((k) => !k.startsWith("@johnlindquist"))
)) as string[]

//grab all the args you used `kit un jquery react`
if (typeof packageNames == "string") {
	packageNames = [packageNames, ...args]
}
let cwd = kenvPath()

if (process.env.SCRIPTS_DIR) {
	cwd = kenvPath(process.env.SCRIPTS_DIR)
}

let isYarn = await isFile(kenvPath("yarn.lock"))
let [tool, toolArgs] = (
	isYarn
		? `yarn${global.isWin ? ".cmd" : ""} remove`
		: `pnpm${global.isWin ? ".cmd" : ""} rm`
).split(" ")

let toolPath = global.isWin ? (isYarn ? "yarn" : "pnpm") : tool

let toolExists = await isBin(toolPath)
if (!toolExists) {
	toolPath = "pnpm"
}

let command = `${toolPath} ${toolArgs} -D ${packageNames.join(" ")}`.trim()

await term({
	command,
	env: {
		...global.env,
		PATH: KIT_FIRST_PATH,
		DISABLE_AUTO_UPDATE: "true" // Disable auto-update for zsh
	},
	cwd
})

export {}
