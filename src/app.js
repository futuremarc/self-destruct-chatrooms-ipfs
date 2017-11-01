const IPFS = require('ipfs')
const OrbitDB = require('./OrbitDB');
const Room = require('ipfs-pubsub-room');
const ipfs = new IPFS({
  repo:repo(),
  EXPERIMENTAL:{
    pubsub:true
  }
});

let canvas, ctx, form, input, room, submit;
let orbitdb, db;

document.addEventListener("DOMContentLoaded", function() {

  form = document.getElementById('form');
  submit = document.getElementById('submit');
  input = document.getElementById('input');
  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext("2d");
  ctx.font = "22px Arial";

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let msg = input.value;
    room.broadcast(msg);
    input.value = '';
  })

});

window.addEventListener('resize',()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.font = "22px Arial";
})

ipfs.once('ready', ()=> ipfs.id((err,info) =>{

  if (err) throw err;

   orbitdb = new OrbitDB(ipfs)

   db = orbitdb.eventlog("destruction")

   db.put("level")
     .then(() => {
       const latest = db.iterator({ limit: 5 }).collect()
       console.log(JSON.stringify(latest, null, 2))
     })


  submit.disabled = false;
  room = Room(ipfs,'ipfs-destruct-chat');


  room.on('peer joined', (peer)=>{
    console.log('peer ' + peer + ' joined');
  });

  room.on('peer left', (peer)=>{
    console.log('peer ' + peer + ' left');
  });

  room.on('peer joined', (peer)=>{
    room.sendTo(peer,'hello ', peer + '!')
  })

  room.on('message', (message)=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let msg = message.data.toString();
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillText(msg,10,50);
    console.log('msg',msg)
  })

}))

function repo(){
  return 'ipfs/destruct-chat/'+ Math.random()
}
