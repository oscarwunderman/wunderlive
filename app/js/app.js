angular.module('app',['ngRoute','ngSanitize','angular-jqcloud','ui.bootstrap', 'ngTouch'])
    .constant('myConfig', {
        'phpUrl': 'http://accion-online.com/nivea/wunderlive',
        //'phpUrl': 'http://wundermanlive-tweets.herokuapp.com',
        //'phpUrl': 'http://localhost/wunderlive-tweets',
        'brandTrendsCat': {
            'nivea': 'NIVEA',
            'nivea_men': 'NIVEA MEN'
        },
        'brandTopicsCat': {
            'nivea': 'NIVEA',
            'nivea_tw': 'NIVEA TWITTER',
            'nivea_fb': 'NIVEA FACEBOOK',
            'nivea_men': 'NIVEA MEN',
            'nivea_men_tw': 'NIVEA MEN TWITTER',
            'nivea_men_fb': 'NIVEA MEN FACEBOOK'
        }
    })
    .config(function($routeProvider,$sceProvider){       
        $routeProvider
            .when('/twitter',{
                controller: 'TwitterCtrl',
                templateUrl: 'partials/twitter.html'
            })
            .when('/trends',{
                controller: 'TrendsCtrl',
                templateUrl: 'partials/trends.html'
            })
            .when('/brandTrends',{
                controller: 'BrandTrendsCtrl',
                templateUrl: 'partials/brandTrends.html'
            })
            .when('/brandTopics',{
                controller: 'BrandTopicsCtrl',
                templateUrl: 'partials/brandTopics.html'
            })
            .otherwise('/twitter',{
                controller: 'TwitterCtrl',
                templateUrl: 'partials/twitter.html'
            }); 
        $sceProvider.enabled(false);  
    })
    .factory('isNotMobile',function(){    
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return !check;

    })
    .factory('socket',function($rootScope) {
        var host = window.location.origin;
        if(host == 'http://localhost') {
            var socket = io.connect(host+':5000');
        } else {
            var socket = io.connect(host);
        }

        return {
            on: function(eventName, callback) {
                socket.on(eventName, function () {  
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    })
    .directive('resize',function($window, isNotMobile) {
        return function(scope, element) {           
            var w = angular.element($window);
            scope.getWindowDimensions = function() {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
                scope.style = function() {
                    return {
                        'height': (newValue.h) + 'px'
                    }
                };
            }, true);
            w.bind('resize',function(){
                scope.$apply();
            });
        }
    })
    .directive('trendData',function(){
        return {
            templateUrl: 'partials/trend-data.html'
        }
    })    
    .directive('tweetList',function(){
        return {
            templateUrl: 'partials/tweet.html'
        }
    })
    .directive('tweetCategories',function(){
        return {
            templateUrl: 'partials/categories.html'
        }
    })
    .controller('TwitterCtrl', ['$http', '$scope', '$location', 'isNotMobile','socket','$timeout', function($http, $scope, $location, isNotMobile,socket,$timeout){

        $scope.showTabMenu = false;
        if (isNotMobile == true){
            $scope.tab = 'all';            
        }else {
            $scope.tab = 'categories';
            $scope.showTabMenu = true;
        }
        $scope.slides = [];

        $scope.setTab = function (tabId) {
            $scope.tab = tabId;
        };

        $scope.isSetTab = function (tabId) {
            return $scope.tab === tabId;
        };     

        socket.on('categories',function(data){
            $timeout(function(){      
                $scope.cats = data; 
            });   
        });

        var current = 0;
        socket.on('tweets',function(data){
            console.log("Entra en tweets");
            $timeout(function(){
                $scope.slides = [];
                var tweets = JSON.parse(data);
                angular.forEach(tweets, function(value,key){
                    console.log(key);
                    if(key != 'category'){
                        console.log("Voy a pushear un valor");
                        console.log(value);
                        $scope.slides.push(value);
                    }
                });           
                console.log($scope.slides);
            });
        });

        $scope.navigate = function(direction,currentBroadcast,callback) {
            // hide the old current list item 
            $timeout(function(){       
                angular.forEach($scope.slides, function(value,key){
                    if($scope.slides[key].current == 1){
                        current = parseInt(key);
                    }
                    $scope.slides[key].current = 0;
                });

                if(currentBroadcast != null) {
                    current = currentBroadcast;                
                }

                // calculate th new position
                var counter = current + direction;
                if (direction === -1 && counter < 0) { 
                    counter = $scope.slides.length - 1; 
                }

                if (direction === 1 && !$scope.slides[counter]) { 
                    counter = 0;
                }
                if(!angular.isUndefined($scope.slides[counter])){
                    $scope.slides[counter].current = 1;                    
                }
    
                if (typeof callback == 'function') {
                    callback(counter);
                }             
            });
        }

        $scope.set = function(id) {
            socket.emit('setCategory',id);
            $timeout(function(){     
                $scope.slides = [];      
            });  
        } 

        $scope.move = function(direction) {
            $timeout(function(){ 
                $scope.navigate(direction,null,function(counter){
                    socket.emit('goTweet',{activeTweet:counter,direction:direction});
                });
            });
        }       

        socket.on('carouselChange',function(data){
            $timeout(function(){ 
                $scope.navigate(data.direction,data.index);
            });
        });

        /*
        socket.on('tweetStop',function(data){
            //stop tweet
            console.log('app tweetStop');
        });
        socket.on('tweetPlay',function(data){
            //play tweet
            console.log('app tweetPlay');
        });
        */

    }])
    .controller('TrendsCtrl', ['$scope','$sce', 'isNotMobile', 'socket','$timeout',function($scope, $sce , isNotMobile, socket,$timeout){     
        
        $scope.urlIframe = $sce.trustAsResourceUrl('https://www.google.com/trends/hottrends/visualize?pn=p26&nrow=5&ncol=5');
        if (isNotMobile == false){
            $scope.urlIframe = $sce.trustAsResourceUrl('https://www.google.com/trends/hottrends/widget?pn=p26&tn=10&h=480');            
        }
    }])
    .controller('BrandTopicsCtrl', ['$http','$scope','myConfig','$sce','socket','$timeout', function($http,$scope,myConfig,$sce, socket,$timeout){
        $scope.categories = myConfig.brandTopicsCat;
        $scope.brand = false;

        $scope.topic = function(id,key,value) {
            $scope.words = [];
            $scope.brand = id;
            $scope.brand_key = key;
            $scope.brand_name = value;         

            var cloud_ajax = $http({
                method: 'POST',
                url: myConfig.phpUrl+'/server/controllers/brandwatch.php?getCloud=1',
                data : {brand:key},
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).then(function successCallback(response){  
                $scope.words = response.data;                                              
            }, function errorCallback(response){
                console.log(response);
            });
        }

        $timeout(function(){  
            $scope.topic(0,'nivea','NIVEA'); 
        }); 

        $scope.topicBot = function(id,key,value) {
            $scope.topic(id,key,value); 
            socket.emit('brandTopicsCategory',{id: id,category: key,brand: value}); 
        }

        socket.on('brandTopicsCategory',function(data){
            $timeout(function(){ 
                $scope.topic(data.id,data.category,data.brand);
            });
        });        
    }])
    .controller('BrandTrendsCtrl', ['$http','$scope','myConfig','$sce','socket','$timeout', function($http,$scope,myConfig,$sce,socket,$timeout){

        $scope.categories = myConfig.brandTrendsCat;
        $scope.url_top = '';
        $scope.url_rising = '';
        $scope.brand = false;

        $scope.trend = function(id,key,value) {
            $timeout(function(){ 

                $scope.url_top = '';
                $scope.url_rising = '';

                var top_ajax = $http({
                    method: 'POST',
                    url:    myConfig.phpUrl+'/server/controllers/google.php?getBrandTrendsTop=1',
                    data : {brand: id},
                    headers: {
                        'Content-Type' : 'application/x-www-form-urlencoded'
                    } 
                }).then(function successCallback(response){
                    $scope.url_top = $sce.trustAsHtml(response.data);
                    $scope.brand = id;
                    $scope.brand_key = key;
                    $scope.brand_name = value;                    
                }, function errorCallback(response){
                    console.log(response);
                }); 

                var rising_ajax = $http({
                    method: 'POST',
                    url:    myConfig.phpUrl+'/server/controllers/google.php?getBrandTrendsRising=1',
                    data : {brand: id},
                    headers: {
                        'Content-Type' : 'application/x-www-form-urlencoded'
                    }  
                }).then(function successCallback(response){
                    $scope.url_rising = $sce.trustAsHtml(response.data);
                    $scope.brand = id;
                    $scope.brand_key = key;
                    $scope.brand_name = value;                      
                }, function errorCallback(response){
                    console.log(response);
                });      

            });
        }

        $scope.trend(0,'nivea','NIVEA'); 

        $scope.trendBot = function(id,key,value) {
            $scope.trend(id,key,value); 
            socket.emit('brandTrendsCategory',{id: id,category: key,brand: value}); 
        }
 
        socket.on('brandTrendsCategory',function(data){
            $timeout(function(){ 
                $scope.trend(data.id,data.category,data.brand);
            });
        });
    }])
;
var trends = { 
    Utils : {
        installScrollableRegion : function(){}
    },
    ShareControl : function(){}
};
