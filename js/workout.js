var types = "random, intensive, slow, hill-climbing, intervall";

Workout = {
    getIntervall : function(tracks) {
		var indexIntervall = Math.floor(tracks.length/3);
		var topTracks = tracks.sort().models.slice(0 , indexIntervall);
		var middleTracks = tracks.sort().models.slice(indexIntervall + 1, indexIntervall * 2);
		var bottomTracks = tracks.sort().models.slice(indexIntervall * 2 + 1 , tracks.length);
		var workoutList = new WorkoutCollection();
		for(var i = 0; i < 4; i++) {
			workoutList.push(bottomTracks.pop());
			workoutList.push(middleTracks.shift());
			workoutList.push(topTracks.shift());
		}
		_(workoutList).each(function(track){console.log(track.get('bpm'))});
		return workoutList;
    },
     getHillClimbing : function(tracks) {
     	return tracks.sort();
    }
}