const redisClient = require("../config/redis");
const User = require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")

// Cookie settings: cross-site cookies in production (Vercel <-> Render), relaxed locally
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
};


const register = async (req, res) => {

    try {
        // validate the data using validator;

        validate(req.body);
        const { firstName, emailId, password } = req.body;


        //hash password before storing in db
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'

        //Rediricting to access credentials 
        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 60 * 60 }); //1 hour
        //sending the data back to frontend
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        res.cookie('token', token, cookieOptions); //setting the cookie up for browser for successfull requests in a valid timeline
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}


const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        if (!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    }
    catch (err) {
        res.status(401).send("Error: " + err);
    }
}


// logOut feature

const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token); //takes that encoded string and converts it back into a readable JS object


        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);//we are setting the expiry date as payload.exp (payload contains the data of the jwt so it contains data like id, email, expid etc.)

        // must use the same secure/sameSite options so the browser actually clears it
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        });
        res.send("Logged Out Succesfully");

    }
    catch (err) {
        res.status(503).send("Error: " + err);
    }
}

//separate route for admin registration

const adminRegister = async (req, res) => {
    try {
        // validate the data;
        //   if(req.result.role!='admin')
        //     throw new Error("Invalid Credentials");  
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        //

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, cookieOptions);
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}


//deleting the user profile
const deleteProfile = async (req, res) => {

    try {
        const userId = req.result._id;

        // userSchema delete
        await User.findByIdAndDelete(userId);

        res.status(200).send("Deleted Successfully");

    }
    catch (err) {

        res.status(500).send("Internal Server Error");
    }
}


module.exports = { register, login, logout, adminRegister, deleteProfile };