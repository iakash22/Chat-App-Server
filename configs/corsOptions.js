exports.corsOptions = {
    origin: [
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        process.env.CLIENT_URL,
    ],
    credentials: true,
}