import { backToMainShortcut, cmd } from "../core/utils.js"
// Name: App Launcher
// Description: Select an App to Launch

let findAppsAndPrefs = async () => {
  log(`findAppsAndPrefs`)
  if (process.platform === "darwin") {
    let apps = await fileSearch("", {
      onlyin: "/",
      kMDItemContentType: "com.apple.application-bundle",
    })
    let manualAppDir = await readdir("/Applications")
    apps = apps.concat(
      manualAppDir
        .filter(app => app.endsWith(".app"))
        .map(app => `/Applications/${app}`)
    )
    // apps = _.uniq(apps.filter(a => !a.includes("Users")))
    let prefs = await fileSearch("", {
      onlyin: "/",
      kind: "preferences",
    })
    return {
      apps,
      prefs,
    }
  } else if (process.platform === "win32") {
    let globalApps = await fileSearch("", {
      onlyin:
        '"%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs"',
      kind: "application",
    })
    let apps = await fileSearch("", {
      onlyin:
        '"%AppData%\\Microsoft\\Windows\\Start Menu\\Programs"',
      kind: "application",
    })
    return {
      apps: [...globalApps, ...apps],
      prefs: [],
    }
  }
}
let createChoices = async () => {
  let { extractIcon } = await npm("get-app-icon")
  setLoading(true)
  let { apps, prefs } = await findAppsAndPrefs()
  let allApps = _.uniq(apps.concat(prefs))

  let choices = _.sortBy(
    await Promise.all(
      allApps.map(async appPath => {
        let { base: appName } = path.parse(appPath)

        return {
          name: appName.replace(/\.(app|lnk|url)\s*$/i, ""),
          value: appPath,
          description: appPath,
          img: await extractIcon(appPath.trim()).catch(
            () => undefined
          ),
          enter: `Open`,
        }
      })
    ),
    ["value", "name"]
  )

  return choices
}
let appsDb = await db(
  kitPath("db", "apps.json"),
  async () => {
    setChoices([
      {
        name: `First Run: Indexing Apps and Caching Icons...`,
        description: `Please hold a few seconds while Script Kit creates icons for your apps and preferences for future use.`,
        info: true,
      },
    ])

    clearTabs()
    setPlaceholder(`One sec...`)

    let choices = await createChoices()
    setFooter(``)
    return {
      choices,
    }
  }
)
let app = await arg(
  {
    input: (flag?.input as string) || "",
    resize: true,
    placeholder: "Select an app to launch",
    shortcuts: [
      backToMainShortcut,
      {
        name: "Refresh Apps",
        key: `${cmd}+enter`,
        bar: "right",
        onPress: async input => {
          setPlaceholder(`Refreshing apps...`)
          await remove(kitPath("db", "apps.json"))
          await run(
            kitPath("main", "app-launcher.js"),
            "--input",
            input
          )
        },
      },
    ],
  },
  appsDb.choices as any
)
if (app) {
  open(app)
}
