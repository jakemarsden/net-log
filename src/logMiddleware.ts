import { RequestHandler } from "express"

const logMiddleware: RequestHandler = (req, res, next) => {
    const startTime = Date.now()
    const reqMsg = `${req.method} ${req.url}`
    console.debug(reqMsg)

    res.on("finish", () => {
        const endTime = Date.now()
        const resMsg = `${res.statusCode} ${res.statusMessage}`
        const durMsg = `in ${(endTime - startTime).toLocaleString()}ms`
        console.debug(`${reqMsg} => [${resMsg}] (${durMsg})`)
    })
    next()
}

export default logMiddleware
