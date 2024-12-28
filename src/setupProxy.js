const { createProxyMiddleware } = require("http-proxy-middleware")
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/RoutePlanSystem", {
      target: "http://42.192.236.76:8080",
      changeOrigin: true,
      pathRewrite: { "^/": "" },
    })
  )
}  