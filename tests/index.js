import { Router } from "nmicro-router";
const appRouter = {
    get:(req, res) => {
         console.log(`Called get`)
    }
}
const router = new Router(appRouter)
router.route(`get`, `/test`, (req, res) => {
    console.log(`Routed`)
})
router.get(`/test2`, (req, res) => {
    console.log(`Routed`)
})