var ko = ko || {};

var Playlist = function (name, uri) {
  var self = this; 
  self.name = ko.observable(name);
  self.uri = ko.observable(uri);
};


var ModelView = function() {
  var self = this;
  self.workoutSession = ko.observable();
  self.playlists = ko.observableArray([]);
  self.selectedPlaylist = ko.observable(new Playlist("Playlist", ""));
  self.playlists([]);
  this.length = ko.observable().extend({ numeric: 0 });

  self.loadPlaylists = function(data) {
    $.each( data, function( i, d ) {
      self.playlists.push( new Playlist(d.name, d.uri));
    });  
  }   

  self.selectPlaylist = function(pl) {
    self.selectedPlaylist(pl);
  }   

  self.submit = function() {
    console.log(self.workoutSession());
    console.log(self.selectedPlaylist().uri());
    console.log(self.length());
    loadPlaylist(self.selectedPlaylist().uri());
  }
};

var modelview = new ModelView();
ko.applyBindings(modelview);

function loadPlaylists(data) {
  modelview.loadPlaylists(data);
}