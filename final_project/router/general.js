const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (!userExists) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login."});
    } else {
      return res.status(409).json({message: "User already exists!"});
    }
  }
  return res.status(400).json({message: "Unable to register user. Please provide username and password."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send the list of books as a formatted JSON string
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(books[isbn]);
  }
  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  
  const booksByAuthor = bookKeys
    .filter(key => books[key].author === author)
    .map(key => ({ isbn: key, ...books[key] }));

  if (booksByAuthor.length > 0) {
    return res.send(JSON.stringify(booksByAuthor, null, 4));
  }
  
  return res.status(404).json({message: "No books found by this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  
  const booksByTitle = bookKeys
    .filter(key => books[key].title === title)
    .map(key => ({ isbn: key, ...books[key] }));

  if (booksByTitle.length > 0) {
    return res.send(JSON.stringify(booksByTitle, null, 4));
  }
  
  return res.status(404).json({message: "No books found by this author"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
