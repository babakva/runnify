
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
        var plArray = [];
        returnedLibrary = Library.forCurrentUser();
        returnedLibrary.playlists.snapshot().done(function(snapshot) {
            for (var i = 0, l = snapshot.length; i < l; i++) {
                var playlist = snapshot.get(i);
                plArray.push(playlist);
            }
            loadPlaylists(plArray);
        });
    });
}

function loadPlaylist(playlistURI, workoutType, length) {
        require(['$api/models','$views/list#List'], function(models, List) {
            models.Playlist.fromURI(playlistURI).load('tracks').done(function(playlist) {
                playlist.tracks.snapshot().done(function(trackSnapshot){
                    var tracks = trackSnapshot.toArray();
                    getBPM(tracks, function(tracksWithBPM) {
                        var workoutList = Workout.getWorkout(tracksWithBPM, workoutType, length);
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
                        loadedPlaylist.tracks.add(models.Track.fromURI(track.uri));
                    });
                });
                var list = List.forPlaylist(playlist);
                document.getElementById('playlistContainer').innerHTML = '';
                document.getElementById('playlistContainer').appendChild(list.node);
                setTimeout(function(){list.init();}, 500);
                
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
    var remainingTracks = tracks.length;
    for (var i=0; i<tracks.length; i++) {
        if(tracks[i] === null) {
            remainingTracks--;
            if(remainingTracks == 0) {
                callback(tracks);
           }
           continue;
        }

        //EchoNest Api can't handle too many calls
        if(i >= 30) {
            callback(tracks);
        }

        var item = tracks[i];
        EchoNest.getBPM(item, function(calledTrack, bpm) {
           if (bpm == -1) {
               remainingTracks--;
               indexOfRemoved = tracks.indexOf(calledTrack);
               if(indexOfRemoved > -1) {
                    tracks.splice(indexOfRemoved, 1);
               }
           } else {
                calledTrack.bpm = Math.round(bpm);
                remainingTracks--;
           }
           if(remainingTracks == 0) {
                callback(tracks);
           }
       });
    }
}

function renderTracksInfo(tracks) {
        console.info("Render Table View");
        var chartData = [];
        var totalLength = 0;
        _.each(tracks, (function(t) {
            chartData.push({x: totalLength, y: t.bpm, track: t});
            totalLength += t.duration;;
        }));

        $("#chartContainer").highcharts({
                chart: {
                    type: 'areaspline',
                    animation: Highcharts.svg // don't animate in old IE
                },
                title: {
                    text: 'Workout'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 200,
                    dateTimeLabelFormats: {
                        second: '%M:%S',
                        minute: '%M:%S',
                        hour: '%M:%S',
                        day: '%M:%S',
                        week: '%M:%S',
                        month: '%M:%S',
                        year: '%M:%S'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Intensity'
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    formatter: function () {
                        var time = new Date(this.point.track.duration);
                        var minutes = time.getMinutes();
                        var seconds = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();
                        return '<b>' + this.point.track.artists[0].name +' - ' + this.point.track.name + '</b>' +
                         '<br>' + this.point.y + ' bpm' + 
                         '<br>time: ' + minutes + '.' + seconds;
                    }
                },
                series: [{
                    name: 'BPM',
                    data: chartData,
                }]
            });
}

$('body').on('click', '.btn-group button', function (e) {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
});

$('#goButton').click(function () {
    var btn = $(this);
    btn.button('loading');
});

loadUserPlaylists();