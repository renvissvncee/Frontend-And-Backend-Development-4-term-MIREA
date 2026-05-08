const express = require("express");

const app = express();
const PORT = 3002;

app.get("/", (req, res) => {
    res.json({
        message: "Response from backend server",
        port: PORT
    });
});

app.listen(PORT, () => {
console.log(`Server started on port ${PORT}`);
});
