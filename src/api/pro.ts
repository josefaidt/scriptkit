import { Channel, UI } from "../core/enum.js"
import { KIT_FIRST_PATH } from "../core/utils.js"
import type { Action } from "../types/core.js"
import type {
	TerminalOptions as TerminalConfig,
	ViteAPI,
	ViteHandler,
	ViteMessage,
	ViteWidget,
	Widget,
	WidgetAPI,
	WidgetHandler,
	WidgetMessage
} from "../types/pro.js"

let createBaseWidgetAPI = (widgetId: number) => {
	let api = {
		capturePage: async () => {
			return (
				await global.getDataFromApp(
					Channel.WIDGET_CAPTURE_PAGE,
					{ widgetId },
					false
				)
			)?.imagePath
		},
		// update: (html, options = {}) => {
		//   global.send(Channel.WIDGET_UPDATE, {
		//     widgetId,
		//     html,
		//     options,
		//   })
		// },
		setState: (state: any) => {
			global.send(Channel.WIDGET_SET_STATE, {
				widgetId,
				state
			})
		},
		close: () => {
			global.send(Channel.WIDGET_END, { widgetId })
		},
		fit: () => {
			global.send(Channel.WIDGET_FIT, { widgetId })
		},
		show: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "show",
				args: []
			})
		},
		hide: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "hide",
				args: []
			})
		},
		showInactive: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "showInactive",
				args: []
			})
		},
		setAlwaysOnTop: (flag: boolean) => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "setAlwaysOnTop",
				args: [flag]
			})
		},
		focus: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "focus",
				args: []
			})
		},
		blur: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "blur",
				args: []
			})
		},
		minimize: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "minimize",
				args: []
			})
		},
		maximize: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "maximize",
				args: []
			})
		},
		restore: () => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method: "restore",
				args: []
			})
		},

		setSize: (width, height) => {
			global.send(Channel.WIDGET_SET_SIZE, {
				widgetId,
				width,
				height
			})
		},
		setPosition: (x, y) => {
			global.send(Channel.WIDGET_SET_POSITION, {
				widgetId,
				x,
				y
			})
		},
		call: (method, ...args) => {
			global.send(Channel.WIDGET_CALL, {
				widgetId,
				method,
				args
			})
		},
		executeJavaScript: async (js) => {
			return await global.sendWaitLong(Channel.WIDGET_EXECUTE_JAVASCRIPT, {
				widgetId,
				value: js
			})
		}
	}

	return api
}

let createViteAPI = (widgetId: number): ViteAPI => {
	let onHandler: Map<string, ViteHandler> = new Map()

	let messageHandler = (data: ViteMessage) => {
		if (onHandler.has(data.channel)) {
			onHandler.get(data.channel)?.(data)
			return
		}
	}

	process.on("message", messageHandler)

	return {
		...createBaseWidgetAPI(widgetId),
		on: (channel: string, handler: ViteHandler) => {
			onHandler.set(channel, handler)
		}
	}
}

let createWidgetAPI = (widgetId: number) => {
	let customHandler: WidgetHandler = () => {}
	let clickHandler: WidgetHandler = () => {}
	let dropHandler: WidgetHandler = () => {}
	let mouseDownHandler: WidgetHandler = () => {}
	let inputHandler: WidgetHandler = () => {}
	let closeHandler: WidgetHandler = () => {
		process.exit()
	}
	let resizedHandler: WidgetHandler = () => {}
	let movedHandler: WidgetHandler = () => {}
	let initHandler: WidgetHandler = () => {}

	let messageHandler = (data: WidgetMessage) => {
		if (data.channel === Channel.WIDGET_CUSTOM && data.widgetId === widgetId) {
			customHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_CLICK && data.widgetId === widgetId) {
			clickHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_DROP && data.widgetId === widgetId) {
			dropHandler(data)
			return
		}

		if (
			data.channel === Channel.WIDGET_MOUSE_DOWN &&
			data.widgetId === widgetId
		) {
			mouseDownHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_INPUT && data.widgetId === widgetId) {
			inputHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_RESIZED && data.widgetId === widgetId) {
			resizedHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_MOVED && data.widgetId === widgetId) {
			movedHandler(data)
			return
		}

		if (data.channel === Channel.WIDGET_END) {
			if (data.widgetId === widgetId) {
				process.off("message", messageHandler)
				closeHandler(data)
			}
		}

		if (data.channel === Channel.WIDGET_INIT && data.widgetId === widgetId) {
			initHandler(data)
			return
		}

		global.warn(`No handler for ${data.channel}`)
	}

	let api: WidgetAPI = {
		onCustom: (handler: WidgetHandler) => {
			customHandler = handler
		},
		onClick: (handler: WidgetHandler) => {
			clickHandler = handler
		},
		onDrop: (handler: WidgetHandler) => {
			dropHandler = handler
		},
		onMouseDown: (handler: WidgetHandler) => {
			mouseDownHandler = handler
		},
		onInput: (handler: WidgetHandler) => {
			inputHandler = handler
		},
		onClose: (handler: WidgetHandler) => {
			closeHandler = handler
		},
		onResized: (handler: WidgetHandler) => {
			resizedHandler = handler
		},
		onMoved: (handler: WidgetHandler) => {
			movedHandler = handler
		},
		onInit: (handler: WidgetHandler) => {
			initHandler = handler
		},

		...createBaseWidgetAPI(widgetId)
	}

	process.on("message", messageHandler)
	return api
}

let vite: ViteWidget = async (dir, options = {}) => {
	let root = kenvPath("vite", dir)
	let widgetDirExists = await pathExists(root)
	if (!widgetDirExists) {
		await ensureDir(root)
		await exec(
			`npm create vite "${root}" -- --template template-vite-react-ts-tailwind`,
			{
				cwd: kenvPath(".widgets")
			}
		)
		await exec("npm i", {
			cwd: root
		})
	}

	const { createServer } = await import("vite")
	const server = await createServer({
		root,
		mode: options?.mode || "development"
	})
	let viteServer = await server.listen(options?.port)

	let url = `http://localhost:${viteServer.config.server.port}`

	log(`Starting vite server at ${url}`)

	let { widgetId } = await global.getDataFromApp(
		Channel.WIDGET_GET,
		{
			command: global.kitCommand,
			html: url,
			options: {
				containerClass:
					"overflow-auto flex justify-center items-center v-screen h-screen",
				draggable: true,
				resizable: true,
				...options
			}
		},
		false
	)

	let api = createViteAPI(widgetId)
	return api
}

// TODO: Support urls. Make sure urls handle "widgetId" for sending messages
let widget: Widget = async (html, options = {}) => {
	// hide()
	let { widgetId } = await global.getDataFromApp(
		Channel.WIDGET_GET,
		{
			command: global.kitCommand,
			html,
			options: {
				containerClass:
					"overflow-auto flex justify-center items-center v-screen h-screen",
				draggable: true,
				resizable: true,
				...options
			}
		},
		false
	)

	return createWidgetAPI(widgetId)
}

let menu = async (label: string, scripts: string[] = []) => {
	return sendWait(Channel.SET_TRAY, {
		label,
		scripts
	})
}

global.term = async (
	commandOrConfig: string | TerminalConfig = "",
	actions?: Action[]
) => {
	let config: TerminalConfig = {
		command: "",
		env: {
			...global.env,
			PATH: KIT_FIRST_PATH
		},
		height: PROMPT.HEIGHT.BASE,
		previewWidthPercent: 40,
		actions,
		shortcuts: [
			{
				name: "Exit",
				key: `${cmd}+w`,
				bar: "right",
				onPress: () => {
					exit()
				}
			},
			{
				name: "Continue",
				key: `${cmd}+enter`,
				bar: "right",
				onPress: () => {
					send(Channel.TERM_EXIT, "")
				}
			}
		]
	}

	if (typeof commandOrConfig === "string") {
		config.command = commandOrConfig
	} else if (typeof commandOrConfig === "object") {
		config = {
			...config,
			...(commandOrConfig as TerminalConfig)
		}
	}

	if (global.__kitCurrentUI === UI.term) {
		// Hack to clear the terminal when it's already open
		await div({
			html: ``,
			height: PROMPT.HEIGHT.BASE,
			onInit: async () => {
				await wait(100)
				submit("")
			}
		})
	}

	return await global.kitPrompt({
		input: config.command,
		ui: UI.term,
		...config
	})
}

global.term.write = async (text: string) => {
	await sendWait(Channel.TERM_WRITE, text)
}

global.widget = widget
global.menu = menu

global.showLogWindow = async (scriptPath = "") => {
	await sendWait(Channel.SHOW_LOG_WINDOW, scriptPath)
}
