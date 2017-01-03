var express = require('express'),
    app = express();
app.use(express.static(__dirname + '/'));
var port = process.env.PORT || 5000;
var io = require('socket.io').listen(app.listen(port));

var http = require("http");    
var querystring = require('querystring');

var encoding = 'utf8';
var categories = [];
var tweets = [];

var tweetElement;
var carouselStatus = 1;

// Tiempos del cambio de item del carrusel
var activeTweet;
var carouselTimeout;
var carouselTimeoutInterval = 8000; // Intervalo entre Tweets
var timeout = 20000;

// Tiempos del cambio de categoria
var activeCategory;
var changeTimeout;
var changeTimeoutInterval = (carouselTimeoutInterval * 10); // Tweets lenght

function PostCode(funct, dataobject, callback) {
    var post_data = querystring.stringify(dataobject);
    var post_options = {
        host: 'accion-online.com',
        port: '80',
        path: '/nivea/wunderlive/server/controllers/'+ funct,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data),
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        }
    };
    var post_req = http.request(post_options, function(res){
        res.setEncoding(encoding);
        var data = "";
        res.on('data',function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            if(typeof callback == 'function') {
                callback(data);
            }            
        });        
    });
    post_req.on('error', function(e) {  
      console.error(e);  
    });
    post_req.write(post_data);
    post_req.end();
}
   
// Funcion para pasar automaticamente de categoria y emitirlo a los clientes
function autoChangeCategory(category) {
    if (category == null) {
        for(var cats in categories) {    
            if (categories[cats].active == 1) {
                categories[cats].active = 0;
                if (categories[parseInt(cats)+1]) {
                    activeCategory = parseInt(categories[parseInt(cats)+1].id);
                    categories[parseInt(cats)+1].active = 1;
                }else{
                    activeCategory = parseInt(categories[cats].id);
                    categories[cats].active = 1;
                }
                break;
            }
            //console.log('activeCategory '+activeCategory);
            if (typeof activeCategory == 'undefined') {
                activeCategory = categories[cats].id;
                categories[cats].active = 1;
                break;
            }   
        }
    } else {
        activeCategory = category;
        for(var cats in categories) {
            if (categories[cats].id == category) {
                categories[cats].active = 1;
            }else{
                categories[cats].active = 0;
            }
        }
    }

    //console.log('activeCategory '+activeCategory); 
    //console.log(categories);
    clearTimeout(carouselTimeout); // paramos el movimiento dle carrusel
    //io.sockets.emit('categories', categories); // mandamos la nueva lista de categorias o nueva seleccionada
    socket.emit('categories', categories);
    updateClientTweets(activeCategory,function(){
        //console.log(tweets.length);
        activeTweet = -1; // nos ponemos en -1 para pasar a 0 en la primera llamada del update
        autoChangeCarousel(); // marcamos el siguiente del carrusel (en este caso el primero)
        // Iniciamos los timmers
        /*if (carouselStatus == 1) { // Solo iniciamos la carga del siguiente si el carrusel no esta parado.
            changeTimeout = setTimeout(function() {
                autoChangeCategory();
            }, changeTimeoutInterval);
        }*/
        console.log('CHANGE CATEGORY:' + activeCategory);
    }); // mandamos el listado de tweets de la categoria activa
}
   
// Funcion para pasar a la siguiente posicion del carrusel de tweets
function autoChangeCarousel(callback) {
    //console.log('dentroChageCarrusel');
    activeTweet = activeTweet + 1;
    //console.log('activeTweet '+ activeTweet +'/'+ tweets.length);
    // Avanzamos a la siguiente siempre que no estemos en el ultimo.
    if (activeTweet >= (tweets.length)) {
        return;
    }
    io.sockets.emit('carouselChange', { index : activeTweet , direction : 1});
    if (carouselStatus == 1) {
        carouselTimeout = setTimeout(function() {
            autoChangeCarousel();
        }, carouselTimeoutInterval);
    }
    if (typeof callback == 'function') {
        callback();
    }
    console.log("TWETT INDEX:" + activeTweet);
}
   
// Esta funcion se encarga de mandar al cliente el listado de tweets
function updateClientTweets(active,callback) {
    //console.log('dentroUpdateTweets');
    PostCode('twitter.php?getTweets=1',{cat:active},function(reply) {
        tweets = reply;
        //console.log(reply);
        activeTweet = activeTweet + 1;
        // Avanzamos a la siguiente siempre que no estemos en el ultimo.
        if (activeTweet >= (tweets.length)) {
            return;
        }
        io.sockets.emit('tweets', tweets);
        console.log('UPDATE CLIENT TWEETS');
        if (typeof callback == 'function') {
            callback();
        }    
    });
}
   
// CARGAMOS LAS CATEGORIAS EN EL ARRAY INICIAL
PostCode('twitter.php?getCategories=1',{},function(reply) {
    //console.log(reply);
    categories = JSON.parse(reply);
    autoChangeCategory();
});

/*PostCode('twitter.php?getTweets=1',{cat:'0'},function(reply) {
    tweets = reply;
    //console.log(reply);
}); */

// INICIAMOS EL SERVIDOR SOCKET.IO DESPUES DE TODO LO DEMAS
io.on('connection', function (socket) {
    socket.emit('categories', categories); // Mandamos al cliente conectado el listado de categorias
    //socket.broadcast.emit('categories', categories);
    socket.emit('tweets', tweets); // Mandamos al cliente el listado de tweets actual
    //socket.broadcast.emit('tweets', tweets);
    socket.emit('carouselChange', { index : activeTweet , direction : 1 }); // Marcamos el actual
    //socket.broadcast.emit('carouselChange', { index : activeTweet , direction : 1 });
    socket.emit('updateStatus', { status : carouselStatus }); // Update Status      
    //socket.broadcast.emit('updateStatus', { status : carouselStatus });  

    //autoChangeCategory();

    socket.on('setCategory', function (category) {
        autoChangeCategory(category);
    });

    socket.on('goTweet', function (data) {    
        activeTweet = data.activeTweet;
        //console.log(data);
        socket.emit('carouselChange', { index : data.activeTweet, direction : data.direction });
        //socket.broadcast.emit('carouselChange', { index : data.activeTweet, direction : data.direction });
        console.log('backTweet '+ activeTweet); 
    });

    /*

    socket.on('tweetStop', function () {
        carouselStatus = 0;
        // Paramos el interval del carrusel y el de las categorias
        clearTimeout(carouselTimeout);
        clearTimeout(changeTimeout);
        //socket.emit('tweetStop', {});
        socket.broadcast.emit('tweetStop', {});      
        console.log('tweetStop');
    });

    socket.on('tweetPlay', function () {
        carouselStatus = 1;
        autoChangeCarousel(); // marcamos el siguiente del carrusel
        // Iniciamos de nuevo el  timer de las categorias pero cambiando el tiempo a (carouselTimeoutInterval * (tweets.length - activeTweet))
        changeTimeout = setTimeout(function() {
            autoChangeCategory();
        }, (carouselTimeoutInterval * (tweets.length - activeTweet)));
        //socket.emit('tweetPlay', {});
        socket.broadcast.emit('tweetPlay', {});      
        console.log('tweetPlay');
    });    
*/

    socket.on('brandTopicsCategory', function (data) {
        console.log(data);
        //socket.emit('brandTopicsCategory', {id: data.id, category: data.category, brand: data.brand}); 
        //socket.broadcast.emit('brandTopicsCategory', {id: data.id, category: data.category, brand: data.brand});         
    });

    socket.on('brandTrendsCategory', function (data) {
        console.log(data);
        //socket.emit('brandTrendsCategory', {id: data.id, category: data.category, brand: data.brand}); 
        //socket.broadcast.emit('brandTrendsCategory',{id: data.id, category: data.category, brand: data.brand});         
    });

    socket.on('menuHome', function () {  
        console.log('server home');
        socket.emit('menuHome');
        //socket.broadcast.emit('menuHome');
        socket.emit('categories', categories); // Mandamos al cliente conectado el listado de categorias
        //socket.broadcast.emit('categories', categories);
        socket.emit('tweets', tweets); // Mandamos al cliente el listado de tweets actual
        //socket.broadcast.emit('tweets', tweets);
        socket.emit('carouselChange', { index : activeTweet , direction : 1 }); // Marcamos el actual
        //socket.broadcast.emit('carouselChange', { index : activeTweet , direction : 1 });
        socket.emit('updateStatus', { status : carouselStatus }); // Update Status      
        //socket.broadcast.emit('updateStatus', { status : carouselStatus });  
    });

    socket.on('menuTrends', function () {
        console.log('server menuTrends');
        socket.emit('menuTrends');
        //socket.broadcast.emit('menuTrends');
    });

    socket.on('menuBrandTrends', function () {
        console.log('server menuBrandTrends');
        socket.emit('menuBrandTrends');
        //socket.broadcast.emit('menuBrandTrends');
        //socket.emit('brandTrendsCategory', {id: 0, category: 'nivea', brand: 'NIVEA'});
        //socket.broadcast.emit('brandTrendsCategory', {id: 0, category: 'nivea', brand: 'NIVEA'});        
    });

    socket.on('menuBrandTopics', function () {
        console.log('server menuBrandTopics');
        socket.emit('menuBrandTopics');
        //socket.broadcast.emit('menuBrandTopics');
        //socket.emit('brandTopicsCategory', {id: 0, category: 'nivea', brand: 'NIVEA'}); 
        //socket.broadcast.emit('brandTopicsCategory', {id: 0, category: 'nivea', brand: 'NIVEA'});         
    });

    socket.on('disconnect', function () {});
});
