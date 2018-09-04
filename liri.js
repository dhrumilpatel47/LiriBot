require("dotenv").config();
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var keys = require("./keys.js");
var request = require("request");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var input = process.argv;
var command = input[2];

var songName = function (array) {
    return array.slice(3).join(" ");
}

var spotifyThisSong = function (song) {
    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        var songArray = data.tracks.items;
        for (var i = 0; i < songArray.length; i++) {
            if (songArray[i].name.toLowerCase() == song.toLowerCase()) {
                var results =
                    "Artist: " + songArray[i].artists[0].name + "\n" +
                    "Song: " + songArray[i].name + "\n" +
                    "Album: " + songArray[i].album.name + "\n" +
                    "Preview Url: " + songArray[i].preview_url + "\n" +
                    "\n";

                console.log("\n" + results);
            }
        }
    })
}

var myTweets = function(){
    client.get('statuses/user_timeline/', { count: 20 }, function (error, tweets, response) {
        if (error) {
            return console.log(error);
        }
        for (var i = 0; i < tweets.length; i++) {
            console.log("Your 20 most recent tweets: ")
            console.log(tweets[i].text);
            console.log(tweets[i].created_at + "\n");
        }
    });
}

var movieName = function (array) {
    return array.slice(3).join("+");
}

var movieThis = function(movie){
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            for (var i = 0;i<JSON.parse(body).Ratings.length;i++){
                if(JSON.parse(body).Ratings[i].Source == ""){
                    var rate = JSON.parse(body).Ratings[i].Value;
                }
                if(!rate && i == JSON.parse(body).Ratings.length-1){
                    rate = "Not Available";
                }
            }

            var results = 
                "Title: " + JSON.parse(body).Title +"\n"
                +"Release Year: " + JSON.parse(body).Year + "\n"
                +"IMDB Rating: " + JSON.parse(body).imdbRating+"\n"
                +"Country: " + JSON.parse(body).Country+"\n"
                +"Language: "+ JSON.parse(body).Language+"\n"
                +"Actors: "+JSON.parse(body).Actors+"\n"
                +"Plot: "+JSON.parse(body).Plot+"\n";
           

            console.log("\n"+results);
        }else{
            console.log(error);
        }
        
      });
}

switch (command) {
    case "my-tweets":
        myTweets();
        break;
    case "spotify-this-song":
        if (!songName(input)) {
            spotifyThisSong("the sign");
        } else {
            spotifyThisSong(songName(input));
        }
        break;
    case "movie-this":
        if (!movieName(input)) {
            movieThis("Mr. Nobody")
        }else{
            movieThis(movieName(input));
        }
        break;
    case "do-what-it-says":
        fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }
        var dataArr = data.split(",");
        var searchTerm = dataArr[1].split('"')[1];
        switch (dataArr[0]) {
            case "my-tweets":
                myTweets();
                break;
            case "spotify-this-song":
                console.log(searchTerm);
                spotifyThisSong(searchTerm);
                break;
            case "movie-this":
                var fileMovieArr = searchTerm.split(" ");
                movieThis(fileMovieArr.splice(0).join("+"));
                break;
            default:
                console.log("Nothing usable in the files..")
                break;
        }});
        break;
        default:
        console.log("Please input a command...")
        break;
}
