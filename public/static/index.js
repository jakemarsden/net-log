Chart.defaults.global.animation.duration = 0
fetchChart({ url: "/api/chart/traffic" }, doc => doc.getElementById("chart_traffic"))

function fetchChart(req, selector) {
    const res = fetchJson(req)
    document.addEventListener("DOMContentLoaded", async () => {
        const $e = selector(document)
        const ctx = $e.getContext("2d")
        const chart = await res
        new Chart(ctx, chart)
    })
}

async function fetchJson({ headers = { accept: "application/json" }, ...req }) {
    const res = await fetchHttp({ ...req, headers })
    return await res.json()
}

async function fetchHttp({ url, method = "GET", ...req }) {
    const startTime = Date.now()
    const reqMsg = `${method} ${url}`
    console.debug(reqMsg)

    const res = await window.fetch(url, { ...req, method })

    const endTime = Date.now()
    const resMsg = `${res.status} ${res.statusText}`
    const durMsg = `in ${(endTime - startTime).toLocaleString()}ms`
    console.debug(`${reqMsg} => [${resMsg}] (${durMsg})`)

    return res
}
