let { setSelectedText } = await kit("text");
let clipboardDb = await db("clipboard-history");
let history = clipboardDb.data.history;
let value = await arg("What to paste?", () => {
    return history.map(({ value, type, timestamp, secret }) => {
        return {
            name: secret
                ? value.slice(0, 4).padEnd(10, "*")
                : value,
            description: timestamp,
            value,
            preview: type === "image"
                ? md(`![timestamp](${value})`)
                : value.includes("\n")
                    ? `<div class="font-mono text-xs">${value
                        .split("\n")
                        .map(line => `<p>${line}</p>`)
                        .join("")}<div>`
                    : null,
        };
    });
});
setSelectedText(value);
export {};
