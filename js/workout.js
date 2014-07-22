var types = "random, intensive, slow, hill-climbing, intervall";

Workout = {
	getWorkout : function(tracks, workoutType, length) {
		var workoutList = [];
		if(workoutType == "hillclimbing") {
			workoutList =  this.getHillClimbing(tracks);
		} else if(workoutType == "interval") {
			workoutList = this.getInterval(tracks);
		} else if(workoutType == "random") {
			workoutList = this.getRandom(tracks);
		}
		return this.timeSession(workoutList, length);
	},
    getInterval : function(tracks) {
		var indexIntervall = Math.floor(tracks.length/3);
		var sortedTracks = tracks.sort(function(a,b) { return b.bpm - a.bpm });

		var topTracks = sortedTracks.slice(0 , indexIntervall);
		var middleTracks = sortedTracks.slice(indexIntervall + 1, indexIntervall * 2);
		var bottomTracks = sortedTracks.slice(indexIntervall * 2 + 1 , tracks.length);
		var workoutList = [];
		for(var i = 0; i < sortedTracks.length; i++) {
			workoutList.push(bottomTracks.pop());
			workoutList.push(middleTracks.shift());
			workoutList.push(topTracks.shift());
		}
		return workoutList;
    },
    getHillClimbing : function(tracks) {
     	return tracks.sort(function(a,b) { return a.bpm - b.bpm });
    },
    getRandom : function(tracks) {
     	return _.shuffle(tracks);
    },
    timeSession : function(workoutList, length) {
    	timedWorkoutList = [];
    	length = length || 120;
    	var totalLength = 0;
		for(var i = 0; i < workoutList.length; i++) {
			if(workoutList[i] === undefined) {
				continue;
			}
			totalLength += workoutList[i].duration/60000;
			timedWorkoutList.push(workoutList[i]);
			if(totalLength > length) {
				break;
			}
		}
    	return timedWorkoutList;
    }
}