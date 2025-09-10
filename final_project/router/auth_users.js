const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
// Check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in. Please provide username and password."});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization.username;

  if (!reviewText) {
    return res.status(400).json({ message: "Review content cannot be empty." });
  }

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = reviewText; // Add or update the user's review
    return res.status(200).json({ message: `Review for book with ISBN ${isbn} has been successfully added/updated.` });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    // Check if a review from this user exists for this book
    if (book.reviews[username]) {
      delete book.reviews[username]; // Delete the user's review
      return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} has been successfully deleted.` });
    } else {
      return res.status(404).json({ message: "Review not found for this user." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
