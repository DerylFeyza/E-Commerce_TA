const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userRoute = require("./routes/user.route");
app.use("/user", userRoute);
const produkRoute = require("./routes/produk.route");
app.use("/produk", produkRoute);

app.listen(PORT, () => {
	console.log(`dah jalan wir ${PORT}`);
});
