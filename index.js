const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const { Product } = require("./models/product.js")
require('dotenv').config();


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride('_method'))

const password = process.env.MONGO_PASSWORD
mongoose.connect(`mongodb+srv://singhru:${password}@rsdb.bodim.mongodb.net/Grocery?retryWrites=true&w=majority`)
    .then(() => {
        console.log("Connection Accepted");
    })
    .catch(() => {
        console.log("Connection Refused");
    });

app.listen(3000, () => {
    console.log("Server Running");
});

app.get("/", (req, res) => {
    res.redirect("/products");
})

app.get("/products/new", (req, res) => {
    res.render("products/new.ejs");
});

app.post("/products", async (req, res) => {
    const newProduct = Product(req.body);
    await newProduct.save();
    res.redirect("/products");

});
app.get("/products", async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category: category });
        res.render("products/index.ejs", { products, category });
    } else {
        const products = await Product.find({});
        res.render("products/index.ejs", { products, category: "All" });
    }
});

app.get("/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/show.ejs", { product })
});

app.get("/products/:id/edit", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render("products/edit.ejs", { product });
    } catch {
        res.render("products/error.ejs");
    }

})

app.get("/products/:id/delete", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/products");
    } catch {
        res.render("products/error.ejs");
    }

})

app.put("/products/:id/edit", async (req, res) => {
    const newProduct = await Product.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/products");
});