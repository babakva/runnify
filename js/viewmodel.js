var TrackModel = Backbone.Model.extend({
    defaults:{
        artist:"None",
        title:"Title",
        track:null,
        id:"None",
        bpm:0,
        length:0,
        spotifyURI:"uri"
    },
    initialize:function() {
        //console.info("Creating TrackModel instance");
    }
});

var TrackCollection = Backbone.Collection.extend({
    model:TrackModel,
    comparator:function(track) {
        return -track.get("bpm");
    }
});


var WorkoutCollection = Backbone.Collection.extend({
    model:TrackModel
});

var TableView = Backbone.View.extend({
    render:function() {
        console.info("Render Table View");
        var chartData = [];
        var table =
            "<table>"+
            "<thead><td>Artist</td><td>Title</td><td>length</td><td>BPM</td></thead>";
        var totalLength = 0;
        this.collection.each(function(t) {
            var time = new Date(t.get("length"));
            var minutes = time.getMinutes();
            var seconds = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();

            table += "<tr>"+
                "<td>"+t.get("artist")+"</td>"+
                "<td>"+t.get("title")+"</td>"+
                "<td>"+minutes + '.' + seconds + "</td>"+
                "<td>"+t.get("bpm")+"</td></tr>";
            chartData.push({x: totalLength, y: t.get("bpm"), track: t});
            totalLength += t.get("length");
        });
        table += "</table>";
        $(this.el).html(table);


        this.$el.highcharts({
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
                        var time = new Date(this.point.track.get("length"));
                        var minutes = time.getMinutes();
                        var seconds = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();
                        return '<b>' + this.point.track.get("artist") +' - ' + this.point.track.get("title") + '</b>' +
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
});


var PlaylistModel = Backbone.Model.extend({
    defaults:{
        name:"None",
        uri:"uri",
        image:""
    },
    initialize:function() {
    }
});

var PlaylistCollection = Backbone.Collection.extend({
    model:PlaylistModel
});

var PlaylistView = Backbone.View.extend({
    el: '#playlists',
    template:  _.template('<select id="playlist-selector" name="playlist-selector"><% var i = 0;_(this.collection.toJSON()).each(function(playlist) { %><option value="<%= playlist.uri %>"><%= playlist.name %></option><% }); %></select>'),
    events: {
        "change select[name='playlist-selector']": "updateSelect"
    },
    render:function() {
        this.$el.html(this.template(this.collection.toJSON()));

    },
    updateSelect: function(e) {
        var newValue = $(e.currentTarget).val();
        loadPlaylist(newValue);
    }
});