
function main() {
        require(['$api/toplists#Toplist','$api/models'], function(Toplist, models) {
            // get user's top artists
            var toplist = Toplist.forCurrentUser();
            // top tracks for all top artists
            var topTracks = [];
            toplist.artists.snapshot(0,5).done(function(artists) {
                var artistLength = artists.length;
                artists.toArray().forEach(function (artist) {
                    artistLength--;
                    topTracks.push(getArtistTopTracks(artist, models, Toplist, function(topTracks){
                        getBPM(topTracks, function(tracksWithBPM) {
                                renderPlaylist(tracksWithBPM);
                                renderTracksInfo(tracksWithBPM);
                        });
                    }));
                });
            });

    });
}

function loadUserPlaylists() {
    require(['$api/library#Library'], function(Library) {
        var playlistCollection = new PlaylistCollection()
        returnedLibrary = Library.forCurrentUser();
        returnedLibrary.playlists.snapshot().done(function(snapshot) {
            for (var i = 0, l = snapshot.length; i < l; i++) {
                var playlist = snapshot.get(i);
                var playlistModel = new PlaylistModel();
                playlistModel.set({
                    uri: playlist.uri,
                    name: playlist.name,
                    error:function(error){console.error("Error")}
                });
                playlistCollection.push(playlistModel);
            }
            plView = new PlaylistView({collection:playlistCollection});
            plView.render();
        });
    });
}

function loadPlaylist(playlistURI) {
    if (playlistURI === null) {
        playlistURI = "spotify:user:babi:playlist:1Cz0g1j82xxq5QSD3YrDYP";
    }
    loadUserPlaylists();
        require(['$api/models','$views/list#List'], function(models, List) {
            models.Playlist.fromURI(playlistURI).load('tracks').done(function(playlist) {
                playlist.tracks.snapshot().done(function(trackSnapshot){
                    var tracks = trackSnapshot.toArray();
                    getBPM(tracks, function(tracksWithBPM) {
                        var workoutList = Workout.getIntervall(tracksWithBPM);
                        renderPlaylist(workoutList);
                        renderTracksInfo(workoutList);
                    });
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
    toplist.tracks.snapshot(0, 5).done(function(tracks) {
        for(var i = 0; i < tracks.length; i++) {
             var track = tracks.get(i);
             topTracks.push(track);
        }
        callback(topTracks);
    });
}

function getBPM(tracks, callback) {
    var allTracks = new TrackCollection();
    var remainingTracks = tracks.length;
    for (var i=0; i<tracks.length; i++) {
        if(tracks[i] === null) {
            remainingTracks--;
            if(remainingTracks == 0) {
                callback(allTracks);
           }
           continue;
        }
        var item = tracks[i];
        var spotifyURI = item.uri;
        var length = item.duration;
        var id = item.uri.split(":")[2];
        var artist = item.artists[0].name;
        var title = item.name;
        var track = new TrackModel();
        track.set({
           id: id,
           title: title,
           artist: artist,
           track: item,
           spotifyURI: spotifyURI,
           length: length,
           error:function(error){console.error("Error")}
        });
        allTracks.push(track);
        EchoNest.getBPM(track, function(calledTrack, bpm) {
           if (bpm == -1) {
               remainingTracks--;
               allTracks.remove(calledTrack);
           } else {
                calledTrack.set("bpm",Math.round(bpm));
                remainingTracks--;
           }
           if(remainingTracks == 0) {
                callback(allTracks);
           }
       });
    }
}

function renderTracksInfo(allTracks) {
    table = new TableView({collection:allTracks});
    table.setElement($("#backbone"));
    table.render();
}
loadUserPlaylists();