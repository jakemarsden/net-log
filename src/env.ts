import dotenv from "dotenv-safe"

dotenv.config({
    path: ".env",
    example: ".env.example",
    encoding: "utf8",
    allowEmptyValues: false
})
