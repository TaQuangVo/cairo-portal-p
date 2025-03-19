const cairoAuthHeader = `Basic ${Buffer.from(`${process.env.CAIRO_USERNAME}:${process.env.CAIRO_PASSWORD}`).toString("base64")}`;


export { cairoAuthHeader }