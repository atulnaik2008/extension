const express =  require('express');

const app = express();

const Port = process.env.Port || 3000;


app.get('/login',( req , res ) =>{
    res.status(200).end();
});

app.get('/logout',( req , res ) =>{
    res.status(200).end();
});

app.use(( req , res , next ) =>{
    res.status(404).send('Route not found.');
});


app.use(( err , req , res , next ) =>{
    res.status(err.status || 500).send(err.message || 'Problem.');
});

const server = app.listen(Port, function(){
   console.log(`server is up and running on port ${server.address().port()}`);
});