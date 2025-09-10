const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
// Check if the user's session contains authorization information
    if (req.session.authorization) {
        // Retrieve the access token from the session
        let token = req.session.authorization['accessToken'];

        // Verify the JWT. Make sure to use the same secret key used for signing the token.
        jwt.verify(token, "access", (err, user) => {
            // If there's an error during verification (e.g., token expired, invalid signature)
            if (err) {
                console.log(err); // Log the error for debugging
                return res.status(403).json({
                    message: "User not authenticated."
                });
            } else {
                // If the token is valid, the payload (user data) is decoded.
                // Attach the decoded user data to the request object for use in subsequent route handlers.
                req.user = user;
                // Pass control to the next middleware function in the stack.
                next();
            }
        });
    } else {
        // If there is no authorization info in the session, the user is not logged in.
        return res.status(403).json({
            message: "User not logged in."
        });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
