const { createProxyMiddleware } = require("http-proxy-middleware")
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/RoutePlanSystem", {
      target: "http://120.26.163.32:8081",
      changeOrigin: true,
      pathRewrite: { "^/": "" },
    })
  )
}  