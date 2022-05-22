const { createProxyMiddleware } = require("http-proxy-middleware")
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/RoutePlanSystem", {
      target: "http://101.43.146.27:8081",
      changeOrigin: true,
      pathRewrite: { "^/": "" },
    })
  )
}  