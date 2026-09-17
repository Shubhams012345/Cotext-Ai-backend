import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl, servicePrefix) => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      return `${servicePrefix}${req.url}`;
    },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    

      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userID;
      }

      return proxyReqOpts;
    },
  });
};