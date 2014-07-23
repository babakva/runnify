EchoNest = {
    getBPM : function(track, callback) {
        var artist = track.artists[0].name;
        var title = track.name;
        var id = track.uri.split(":")[2];
        id = "spotify-WW:track:"+id;
        var url = 'http://developer.echonest.com/api/v4/track/profile?api_key=[api_key]'+
            '&id='+id+
            '&bucket=audio_summary';
        $.ajax( {
                url:url,
                success: function(data) {
                    if (data.response.status.code === 0) {
                        var bpm = data.response.track.audio_summary.tempo;
                        callback(track, bpm);
                    }
                    else {
                        console.info("Unable to find "+artist+"-"+title);
                        callback(track, -1);
                    }
                },
                error:function(data, text, error) {
                    console.error("Fail loading! "+text+": "+error);
                }
            }
        );

    }
}