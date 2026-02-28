import axios from "axios";

const getBloodServiceUrl = () =>
  process.env.BLOOD_SERVICE_URL || "http://localhost:5003";

const forwardRequest = async (req, path) => {
  const base = getBloodServiceUrl().replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : "/" + path}`;
  console.log("[gateway->blood]", req.method, url);

  const res = await axios({
    method: req.method,
    url,
    data: req.body,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": String(req.user.userId),
      "x-role": String(req.user.role),
    },
  });
  return res.data;
};

export { forwardRequest };