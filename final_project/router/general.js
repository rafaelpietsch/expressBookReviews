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
public_users.get('/',async function (req, res) {
    try {
      // Create a promise that resolves with the books object
      const getBooks = () => new Promise((resolve, reject) => {
        resolve(books);
      });
  
      // Await the resolution of the promise
      const allBooks = await getBooks();
      
      // Send the books as a JSON response
      return res.status(200).json(allBooks);
    } catch (error) {
      // Handle any potential errors
      return res.status(500).json({message: "Error fetching book list."});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const getBook = () => new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
      const book = await getBook();
      return res.status(200).json(book);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author;
    try {
        const getBooksByAuthor = () => new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = bookKeys
                .filter(key => books[key].author === author)
                .map(key => books[key]);

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("No books found by this author");
            }
        });
        const authorBooks = await getBooksByAuthor();
        return res.status(200).json(authorBooks);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title;
    try {
        const getBooksByTitle = () => new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = bookKeys
                .filter(key => books[key].title.toLowerCase().includes(title.toLowerCase()))
                .map(key => books[key]);

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("No books found with this title");
            }
        });
        const titleBooks = await getBooksByTitle();
        return res.status(200).json(titleBooks);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
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
