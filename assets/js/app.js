//html loading before js runs
$(document).ready(function() {
  console.log("ready!");
  var user = "";
  var songs = [];

  //THESE ARE HELPER FUNCTIONS TO BREAK DOWN THE URL AND SAVE THE ACCESS TOKEN
  function getParameterByName(name) {
    var match = RegExp("[#&]" + name + "=([^&]*)").exec(window.location.hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  function getAccessToken() {
    return getParameterByName("access_token");
  }
  var access_token = getAccessToken();
  // console.log("Access token attempted to set:", access_token);
  localStorage.setItem("access_token", access_token);
  //Setting the access token to setup spotifyAPI to extend usage

  // function getUsername(callback) {
  //   //THIS IS AN IIFE (YOU TO FILL THIS IN)
  //   console.log("getUsername");
  var url = "https://api.spotify.com/v1/me/";
  $.ajax(url, {
    dataType: "json",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("access_token")
    },
    success: function(data) {
      console.log("pulled username response", data);
      user = data;
    },
    error: function(error) {
      console.log(error);
      return error;
    }
  });

  // making playlist with Spotify ajax call
  function makePlaylist(access_token, user, songs) {
    console.log(user);
    console.log(access_token);

    var urlString =
      "https://api.spotify.com/v1/users/" + user.id + "/playlists";

    var jsonData = {
      name: "My Fucking Playlist",
      public: false
    };

    $.ajax({
      type: "POST",
      url: urlString,
      data: JSON.stringify(jsonData),
      dataType: "json",
      headers: {
        Authorization: "Bearer " + access_token
      },
      contentType: "application/json",
      success: function(result) {
        console.log(result);
        console.log("Woo");

      },
      error: function(error) {
        console.log(error);
        console.log("Error");
      }
    

        // so this is where we are going to perform the search for songs 
        // var spotifyPlaylistId = result.id 
        // var urlStringForPlaylist = 'https://api.spotify.com/v1/playlists/' + spotifyPlaylistId + '/tracks?uris=' + spotifyTracksArray.replace
        // $.ajax({
        //   type: "POST",
        //   url: urlStringForPlaylist,
        //   data: JSON.stringify(jsonData),
        //   dataType: "json",
        //   headers: {
        //     Authorization: "Bearer " + access_token
        //   },

        // spotifyTracksArray

   
  });
}

  $("#playlist").on("click", function() {
    makePlaylist(access_token, user);
  });

  $("#submitPress").on("click", function(event) {
    event.preventDefault();
    var artistName = $("#user-input").val();
    searchSetlistFM(artistName);
  });

  // search setlistFM for artist mbid
  function searchMBID(mbid) {
    // CORS-anywhere hack - we're doing this instead of creating a server
    var originalURL =
      "https://api.setlist.fm/rest/1.0/search/setlists?artistMbid=" +
      mbid.replace(/\"/g, "") +
      "&p=1";
    var queryURL = "https://cors-anywhere.herokuapp.com/" + originalURL;
    $.ajax({
      url: queryURL,
      method: "GET",
      dataType: "json",
      // this headers section is necessary for CORS-anywhere
      headers: {
        "x-requested-with": "xhr",
        "x-api-key": "6d1b43e2-d601-4dee-91e1-9889e57516f7"
      }
    }).done(function(response) {
      artistSetlists = response.setlist;
      console.log(artistSetlists);

      artistSetlists.map(function(val, i) {
        // now we are in the loop, and we are accessing setlists

        // we are creating an empty array per setlist in var songs 
        // this is so we can push the songs from an individual setlist into its own array
        songs.push([]);

        var result = val.sets.set.map(function(set) {
          // we are looping over the songs in a setlist and pushing the song name
          // into the correct var songs array e.g. songs[i]
          set.song.map(function(song, x){
            songs[i].push(song.name);
          })
        });

        console.log(songs);

        // This is literally to display HTML, nothing more
        result.map(function(song) {
          $('#song-list').html(`<p>${song}</p>`);
        });

        // This is displaying the set lists on the page
        var dateText = $("<p>").html(artistSetlists[i].eventDate);
        var citystateText = $("<p>").html(
          artistSetlists[i].venue.city.state +
            ", " +
            artistSetlists[i].venue.city.name
        );

        var button = $(
          `<button id="view-button" data-url=${
            artistSetlists[i].url
          }>View</button>`
        );


        var createPlaylistButton = $('<button/>', {
          text: 'Create Playlist',
          id: 'button-' + i,
          click: function() { 
            var b;
            var spotifyTracksArray = [];

            // for each song name get spotifySongUrl
            for (b = 0; b < songs[i].length; ++b) {
              $.ajax({
                type: "GET",
                url: "https://api.spotify.com/v1/search?type=track&query=" + songs[i][b] + ' ' + $("#user-input").val(),
                dataType: "json",
                headers: {
                  Authorization: "Bearer " + access_token
                },
                contentType: "application/json",
                success: function(result) {
                  console.log(result);
                  spotifyTracksArray.push(result.tracks.items[0].uri)
                  console.log(spotifyTracksArray);
                  // now we need to push uri into spotifySongsUrls
                },
                error: function(error) {
                  console.log(error);
                  console.log("Error");
                }
              });

            }
            // makePlaylist(access_token, user, spotifyTracksArray)
            // console.log('these are the songs i need to search for: ' + $(this).attr('data-songs'))
          },
          'data-songs': songs[i]
        });


        $("#setlist-results").append(dateText, citystateText, button, createPlaylistButton);
      });


      // $("#setlist-results").append(button)

      $(document).on("click", "#view-button", function(event) {
        event.preventDefault();
        var link = $(this).attr("data-url");
        console.log(this);
        console.log("view button was clicked");
        window.open(link, "_blank");
      });
    });
  }

  function searchSetlistFM(artistName) {
    var originalURL =
      "https://api.setlist.fm/rest/1.0/search/artists?artistName=" +
      artistName +
      "&p=1&sort=relevance";
    var queryURL = "https://cors-anywhere.herokuapp.com/" + originalURL;

    $.ajax({
      url: queryURL,
      method: "GET",
      dataType: "json",
      // this headers section is necessary for CORS-anywhere
      headers: {
        "x-requested-with": "xhr",
        "x-api-key": "6d1b43e2-d601-4dee-91e1-9889e57516f7"
      }
    })
      .done(function(response) {
        var artistMBID = JSON.stringify(response.artist[0].mbid);

        // This function does the setlist lookup and performs HTML front-end stuff
        searchMBID(artistMBID);
      })
      .fail(function(jqXHR, textStatus) {
        console.error(textStatus);
      });
  }

});