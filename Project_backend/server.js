const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express();

app.use(cors())
app.use(express.json())

const port= process.env.PORT || 4000;

const URI ="mongodb+srv://tester1:123@cluster0.mio55fa.mongodb.net/projectData"

const connectToDB = async () => {
    try {
        await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB Server');
        app.listen(port, () => {
            console.log("Server is running on port " + port);
        });
    } catch (err) {
        console.error('Error Connecting to MongoDB ', err);
    }
};

connectToDB();

const Schema = mongoose.Schema

const BGSchema = new Schema({
    Name:{type:String, required: true},
    MinPlayer:{type:Number, required: true},
    MaxPlayer: {type:Number, required:true},
    InStock:{type:Number, required:true},
    ImgUrl:{type:String, required:true},
    Descr:{type:String, required:true},
})

const BoardGame = mongoose.model("BoardGames", BGSchema)

const router = express.Router();

app.use('/api', router)

//GET '/'
router.route('/getboardgames')
.get(async (req,res) => {
    try {
        const bgs = await BoardGame.find();
        res.json(bgs);
    } catch (err) {
        res.status(400).json("Error Happened 1");
    }
})

//GET '/id'
router.route('/getboardgames/:id')
.get(async (req,res) => {
    try {
        const bg = await BoardGame.findById(req.params.id);
        res.json(bg);
    } catch (err) {
        res.status(400).json("Error Happened 2");
    }
})

// Post new board game
router.route('/addboardgames')
.post(async (req,res) => {
    const { Name, MinPlayer, MaxPlayer, InStock, ImgUrl, Descr } = req.body;
    const newGame = new BoardGame({ Name, MinPlayer, MaxPlayer, InStock, ImgUrl, Descr });
    try {
        await newGame.save();
        res.json("New Board Game Product Added");
    } catch (err) {
        res.status(400).json("error: " + err);
    }
})

// Put '/updateall/:id'
router.route('/updateboardgames/:id')
.put(async (req,res) => {
    try {
        const bg = await BoardGame.findById(req.params.id);
        bg.set(req.body);
        await bg.save();
        res.json("Board Game Updated");
    } catch (err) {
        res.status(400).json("error: " + err);
    }
})

//Delete
// Delete '/delete'
router.route('/deleteboardgames/:id')
.delete(async (req,res) => {
    try {
        await BoardGame.findByIdAndDelete(req.params.id);
        res.json("Product Removed");
    } catch (err) {
        res.status(400).json("error: " + err);
    }
})

const UserSchema = new Schema({
    userName:{type:String, required: true},
    password:{type:String, required: true},
    isAdmin: {type:Boolean, required:false},
    address:{type:String, required:true},

    orderHistory: {
        type: [{
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    }
})

const UserInfor = mongoose.model("UserInfors", UserSchema)

// add new admin
router.route('/users/addAdmin')
.post(async (req,res) => {
    const { userName, password, isAdmin, address } = req.body;
    const newUser = new UserInfor({ userName, password, isAdmin, address });
    try {
        await newUser.save();
        res.json("New Admin Added");
    } catch (err) {
        res.status(400).json("error: " + err);
    }
})

// add new user
router.route('/users/addUser')
.post(async (req,res) => {
    const { userName, password, address } = req.body;
    const newUser = new UserInfor({ userName, password, address });
    try {
        await newUser.save();
        res.json("New User Added");
    } catch (err) {
        res.status(400).json("error: " + err);
    }
})

//GET '/users'
router.route('/users/get')
.get(async (req,res) => {
    try {
        const users = await UserInfor.find();
        res.json(users);
    } catch (err) {
        res.status(400).json("Error Happened fetching users");
    }
})

// GET '/api/users/getOrderHistory/:userId'
router.route('/users/getOrderHistory/:userId')
.get(async (req, res) => {
    const userId = req.params.userId;
    try {
        // Find the user by userId
        const user = await UserInfor.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }
        // Return the order history of the user
        res.json(user.orderHistory);
    } catch (err) {
        res.status(400).json("Error fetching order history: " + err);
    }
});

// GET '/api/users/getone'
router.route('/users/getone')
.get(async (req, res) => {
    const { userName } = req.query;
    try {
        // Find the user by username
        const user = await UserInfor.findOne({ userName });
        if (!user) {
            return res.status(404).json("User not found");
        }
        // Return the user data
        res.json(user);
    } catch (err) {
        res.status(400).json("Error fetching user data: " + err);
    }
});


// POST '/api/users/login'
router.route('/users/login')
.post(async (req, res) => {
    const { userName, password } = req.body; // Corrected from userId to userName
    try {
        // Find the user in the database by username
        const user = await UserInfor.findOne({ userName });

        // Check if the user exists and the password matches
        if (user && user.password === password) {
            // Send a success response with user information
            res.json({ success: true, user });
        } else {
            // Send an error response if authentication fails
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        // Send an error response if an error occurs
        console.error('Error authenticating user:', err);
        res.status(500).json({ success: false, message: 'An error occurred while authenticating user' });
    }
});


// Route to add order history to a specific user
router.route('/users/addOrderHistory')
  .post(async (req, res) => {
    const { userId, orderItems } = req.body;
    try {
      // Find the user by userId
      const user = await UserInfor.findById(userId);
      if (!user) {
        return res.status(404).json("User not found");
      }
      // Add the order history items to the user
      user.orderHistory.push(...orderItems);
      await user.save();
      res.json("Order history added to user successfully");
    } catch (err) {
      res.status(400).json("Error adding order history: " + err);
    }
  });