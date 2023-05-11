require('dotenv-safe').config()

const app = require('express')();
const cors = require('cors');
const fs = require('fs');
var mime = require("mime-types");

app.options('*', cors())
const initMySQL = require("./config/mysql");
const MODEL = require("./app/models/models");
const sequelize = require("sequelize");

// const initMongo = require('./config/mongo')

// const Chat = require('./app/models/chat')
const uuid = require('uuid')
var options = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/production.promaticstechnologies.com/privkey.pem",
      "utf8"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/production.promaticstechnologies.com/fullchain.pem",
      "utf8"
    ),
  };


const https = require('https').createServer(options, app);
const io = require('socket.io')(https, { // for cors purpose
  cors: {
    origin: "*", // allowed any origin
  }
});
const port = 3012;

io.on('connection', (socket) => {
  console.log("Socket connected...", socket.client.conn.server.clientsCount)

  // For send message and recieve
  socket.on('chat_message', async msg => {
    console.log('chat msg)))))', typeof (msg), msg);

    if (typeof (msg) == "string") {
      msg = JSON.parse(msg)
    }
    const added = await MODEL.chats.create({
      room_id: msg.room_id,
      message: msg.message,
      primary_room_id: msg.primary_room_id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
    })

    // socket.join(msg.room_id);
    io.to(msg.room_id).emit('chat_message', added);
    console.log("***********", added);

    // io.to(msg.room_id).emit('chat message', msg);
  });

 

  // For join room
  socket.on('room join', (msg) => {
    socket.join(msg.room_id);
    console.log('Room joined -> ', msg.room_id)
    io.to(msg.room_id).emit('room join', msg)
  })

  socket.on('leave room', (msg) => {
    console.log('LEAVING', msg)
    socket.leave(msg.room_id);
    io.to(msg.room_id).emit('leave room', msg)
    console.log('LEAVING', msg.room_id)
  })

  // socket.on('total joinee', (msg) => {
  //   msg.total = io.sockets.adapter.rooms.get(msg.room_id).size
  //   console.log('Total -> ', msg.total)
  //   io.to(msg.room_id).emit('total joinee',msg)
  // })


  




  socket.on('test event', async msg => {
    io.to(msg.room_id).emit('test event', msg)
  })

  socket.on('textMessage', async msg => {
    console.log(msg)
    if (typeof (msg) == "string") {
      msg = JSON.parse(msg)
    }
    const added = await MODEL.chats.create({
      room_id: msg.room_id,
      message: msg.message,
      primary_room_id: msg.primary_room_id,
      sender_id: msg.sender_id,
      contract_id: msg.contract_id,
      receiver_id: msg.receiver_id,
    })


    // socket.join(msg.room_id);
    io.to(msg.room_id).emit('textMessage', added);
    // console.log("***********", added);


    // io.to(msg.room_id).emit('textMessage', msg)
  })





});

io.of("/").adapter.on("leave-room", (room) => {
  io.to(room).emit('leave joinee', room);
  console.log(`room ${room} was leaved`);
});

io.of("/admin").adapter.on("leave-room", (room) => {
  io.to(room).emit('leave joinee', room);
  console.log(`room ${room} was leaved`);
});


https.listen(port, () => {
  console.log(`Socket.IO server running at ${port}/`);
});

// initMongo()
