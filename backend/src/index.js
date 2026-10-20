const express = require('express')
const app = express();
require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const cors = require('cors')

// Needed on Render (runs behind a proxy) so secure cookies work
app.set("trust proxy", 1);

app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);

const PORT = process.env.PORT || 3000;

// Start listening immediately so Render detects the open port
app.listen(PORT, () => {
    console.log("Server listening at port number: " + PORT);
});

const InitalizeConnection = async () => {
    try {
        await main();
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("MongoDB Error: " + err);
    }

    try {
        await redisClient.connect();
        console.log("Redis Connected");
    } catch (err) {
        console.log("Redis Error: " + err);
    }
};

InitalizeConnection();