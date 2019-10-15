import express, { RequestHandler, Router } from "express"

export default class RootController {
    readonly router: Router = express.Router()

    constructor() {
        this.router.get("/", this.handleReq)
    }

    private readonly handleReq: RequestHandler = async (_, res) => {
        const renderOpts = {
            app: {
                baseUrl: process.env.APP_URL!,
                title: process.env.APP_TITLE!
            }
        }
        res.render("index", renderOpts)
    }
}
