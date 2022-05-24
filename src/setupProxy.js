const { createProxyMiddleware } = require("http-proxy-middleware")
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/RoutePlanSystem", {
      target: "http://smallsmart.top:9930",
      changeOrigin: true,
      pathRewrite: { "^/": "" },
    })
  )
}  