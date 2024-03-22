const express = require("express");
const app = express();
const PORT = 8080;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const corsOptions = {
	origin: "http://localhost:5173",
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const userRoute = require("./routes/user.route");
app.use("/user", userRoute);
const produkRoute = require("./routes/produk.route");
app.use("/produk", produkRoute);
const transaksiRoute = require("./routes/transaksi.route");
app.use("/transaksi", transaksiRoute);
const cartRoute = require("./routes/cart.route");
app.use("/cart", cartRoute);
const receiptRoute = require("./routes/receipt.route");
app.use("/receipt", receiptRoute);

app.listen(PORT, () => {
	console.log(`dah jalan wir ${PORT}`);
});
