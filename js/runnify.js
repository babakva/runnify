
function main() {
        require(['$api/toplists#Toplist','$api/models'], function(Toplist, models) {
            // get user's top artists
            var toplist = Toplist.forCurrentUser();
            // top tracks for all top artists
            var topTracks = [];
            toplist.artists.snapshot().done(function(artists) {
                artists.toArray().forEach(function (artist) {
                    topTracks.push(getArtistTopTracks(artist, models, Toplist, function(topTracks){
                        var allTracks = sortTracks(topTracks, function(allTracks) {
                            renderPlaylist(allTracks);
                            renderTracksInfo(allTracks);
                        });
                    }));
                });
            });

    });
}

function renderPlaylist(allTracks) {
    require(['$api/models','$views/list#List'], function(models, List) {
            models.Playlist.createTemporary("playlist").done(function(playlist) {
                playlist.load('tracks').done(function(loadedPlaylist) {
                    loadedPlaylist.tracks.clear();
                    allTracks.forEach(function(track) {
                        loadedPlaylist.tracks.add(models.Track.fromURI(track.get("spotifyURI")));
                    });
                });
                var list = List.forPlaylist(playlist);
                document.getElementById('playlistContainer').innerHTML = '';
                document.getElementById('playlistContainer').appendChild(list.node);
                list.init();
            });
    });
}

function getArtistTopTracks(artist, models, Toplist, callback) {
    var artistURI = artist['uri'];
    var artist = models.Artist.fromURI(artistURI);
    var toplist = Toplist.forArtist(artist);
    // fetch the 10 most played tracks
    var topTracks = []
    toplist.tracks.snapshot(0, 10).done(function(tracks) {
        for(var i = 0; i < tracks.length; i++) {
             var track = tracks.get(i);
             topTracks.push(track);
        }
        callback(topTracks);
    });
}

function sortTracks(tracks, callback) {
    allTracks = new TrackCollection();
    for (var i=0; i<tracks.length; i++) {
        var item = tracks[i];
        var spotifyURI = item.uri;
        var id = item.uri.split(":")[2];
        var artist = item.artists[0].name;
        var title = item.name;
        var track = new TrackModel();
        track.set({
           id:id,
           title:title,
           artist:artist,
           track:item,
           spotifyURI:spotifyURI,
           error:function(error){console.error("Error")}
        });
        allTracks.push(track);
        EchoNest.getBPM(track, function(calledTrack, bpm) {
           if (calledTrack === null) {
               console.error("Unable to find BPM for "+artist+"-"+title);
           } else {
               calledTrack.set("bpm",bpm);
           }
           if(i == tracks.length) {
                callback(allTracks.sort());
           }
       });
    }
}

function renderTracksInfo(allTracks) {
    table = new TableView({collection:allTracks});
    table.setElement($("#backbone"));
    table.render();
}