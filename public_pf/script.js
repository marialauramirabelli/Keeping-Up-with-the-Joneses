//source: https://datahelpdesk.worldbank.org/knowledgebase/articles/906519
//"socio-economic class": name of class, lower income bound, upper income bound
sec = [["High", 12476, 12500], 
["Upper Middle", 8036, 12475], 
["Middle", 4036, 8035],
["Lower Middle", 1026, 4035], 
["Low", 1, 1025], 
["Extremely Low", 0, 0]];

//taken from lists of the most common surnames in the United States and the United Kingdom
//Ordered alphabetically, some letters have been eliminated (mostly because surnames beginning with these are not common in English)
//"J" was taken out because Jones is already part of the title, and "Y" was eliminated because "YOU" (user) is always part of the neighborhood
surnames = ["Anderson", 
"Brown", 
"Cooper", 
"Davis", 
"Edwards", 
"Fisher", 
"Green", 
"Harris", 
"Johnson", 
"King", 
"Lewis", 
"Miller", 
"Nelson", 
"O'Neill", 
"Phillips", 
"Quinn", 
"Roberts", 
"Smith", 
"Thompson", 
"Williams"];

//lists where the name, sec, and income of each household in the neighborhood will be stored
user = [];
neighbours = [];

initialTime = Date.now();

//increases with time, user begins with first generation household
generation = 1;

//indicates whether job alert should go off or not
job_available = false;
//if on (true), will tell user to click coin button
job_alert = false;
//every time job is available, checks clicks made by user
job_clicks = 0;
//every time job opportunity ends, checks points obtained from user's clicks
job_points = 0;
//when a job is available, secClicks checks the sec of the user, the "click goal" for that job based on the sec, and the points that the user will gain/lose if the goal is reached/not reached
secClicks = [["Upper Middle", 130, 2000],
["Middle", 140, 2000],
["Lower Middle", 150, 1000],
["Low", 160, 1000],
["Extremely Low",180, 800]];

//user begins with no obstacle
obstacle = "";
//if a user has no obstacle, at a certain time one of the obstacles from obstacle_all will be randomly assigned
//If the obstacle is "debt", at a certain time one of the obstacles in obstacle_debt will be assigned
//If the obstacle is "disease", at a certain time one of the obstacles in obstacle_disease will be assigned
obstacle_all = ["", "debt", "disease"];
obstacle_debt = ["", "disease"];
obstacle_disease = ["", "debt"];

//checks if user has pressed "X" button in the upper right corner
quit_botton = false;
//checks if any households in the neighborhood has been pressed, and which (0 - 5)
//at -1, no house has been pressed yet
property_button = -1;
//checks if user has pressed the tv button, and thus if a YouTube video is playing
playing = false;

//gets miliseconds that have passed since start of game, and converts to hours, minutes, seconds to be displayed and used by program in other functions
function convertTime(miliseconds) {
  totalSeconds = Math.floor(miliseconds/1000);
  halfSeconds = Math.floor(miliseconds/500);
  hours = Math.floor(totalSeconds/3600);
  minutes = Math.floor((totalSeconds%3600)/60);
  seconds = totalSeconds - (minutes * 60) - (hours * 3600);
  if (hours < 10){
  	h = "0"+hours;
  }
  else{
  	h = hours;
  };
  if (minutes < 10){
  	m = "0"+minutes;
  }
  else{
  	m = minutes;
  };
  if (seconds < 10){
  	s = "0"+seconds;
  }
  else{
  	s = seconds;
  };
  return h + ":" + m + ":" + s;
};

//subtracts current time from time initialized at start of game to obtain miliseconds that have passed since
//displays time that has passed and generation (which it also calculates - it increases every 10 minutes)
//checks if user has won
// halfSeconds are used to achieve the blinking effect of the job alert title when a job is available
function checkTime(){
  timeDifference = Date.now() - initialTime;
  formatted = convertTime(timeDifference);
  document.getElementById("time").innerHTML = "Time: " + formatted;
  document.getElementById("generation").innerHTML = "Generation: " + generation;
  if(user[1] == "High"){
  	clearInterval(timer);
	clearInterval(informer);
	clearInterval(clicker);
  	win();
  };
  generation = Math.floor(hours*6) + Math.floor(minutes/10)+1;
  	if(job_available == true && halfSeconds%2 == 0){
		job_alert = true;
	}
	else{
		job_alert = false;
	};
};

//makes a job available every minute (when the timer's seconds = 30)
//every time a job ends, after 30 seconds (when the timer's seconds = 00), checks if user has won or lost points based on her/his clicks, and on the current obstacle
// if obstacle is debt or disease and user has reached click goals, income doesn't increase (money that has been earned pays off debt or pays for healthcare to cure disease)
//if user has won points, displays green arrow. If user has lost points, displays red arrow. Else, no arrow is displayed
//also assigns new obstacle once a job opportunity ends (if obstacle is debt or disease, new obstacle is assigned only if clicks goal was reached; else, current obstacle remains)
function checkClicks(){
	timeDifference = Date.now() - initialTime;
  	formatted = convertTime(timeDifference);
	if(seconds == 30){
		job_available = true;
		job_clicks  = 0;
	}
 	else if(seconds == 0){
	  	job_available = false;
	  	if(minutes > 0){
	  		for(i=0; i<5; i++){
	  			if(user[1] == secClicks[i][0]){
	  				if(job_clicks >= secClicks[i][1]){
	  					if(obstacle == ""){
	  						reassignIncome(secClicks[i][2]);
	  						document.getElementById("arrow_income").style.backgroundImage = "url('greenarrow.png')";
	  						obstacle = obstacle_all[Math.floor(Math.random()*3)];
	  					}
	  					else if(obstacle == "debt"){
	  						obstacle = obstacle_debt[Math.floor(Math.random()*2)];
	  						document.getElementById("arrow_income").style.backgroundImage = "url('blankarrow.png')";
	  					}
	  					else{
	  						obstacle = obstacle_disease[Math.floor(Math.random()*2)];
	  						document.getElementById("arrow_income").style.backgroundImage = "url('blankarrow.png')";
	  					};
	  				}
	  				else{
	  					reassignIncome(-(secClicks[i][2]));
	  					document.getElementById("arrow_income").style.backgroundImage = "url('redarrow.png')";
	  					if(obstacle == ""){
	  						obstacle = obstacle_all[Math.floor(Math.random()*3)];
	  					}
	  				};
	  			};
	  		};
	  	};
	};
};

//randomly assigns sec and corresponding income (and surname for neighbours)
function assignNameIncome(digit){
	if(digit == 0){
		name = "YOU";
		n_sec = Math.floor((Math.random()*4)+1);
	}
	else{
		rand = Math.floor(Math.random()*surnames.length);
		name = surnames[rand];
		surnames.splice(rand, 1);
		n_sec = Math.floor(Math.random()*5);
	};
	n = [name, "", 0];
	n[1] = sec[n_sec][0];
	n[2] = sec[n_sec][(Math.floor(Math.random()*2))+1]; 
	return n;
};

function assignAll(){
	user = assignNameIncome(0);
	neighbours.push(assignNameIncome(1));
	neighbours.push(assignNameIncome(1));
	neighbours.push(assignNameIncome(1));
	neighbours.push(assignNameIncome(1));
	neighbours.push(assignNameIncome(1));
};

//assigns new income to user and neighbours every time a job opportunity ends, based on whether or not the user reached the click goal, and whether or not he/she had an obstacle
//the users change in income, positive or negative, is redistributed amongst the neighbours; if the user earns, they lose, and viceversa
function reassignIncome(ch){
	if((user[2] + ch) < 0){
		user[2] = 0;
	}
	else if(user[2] + ch > 12500){
		user[2] = 12500;
	}
	else{
		user[2] = user[2] + ch;
	};
	for(i=0; i<6; i++){
		if(user[2] >= sec[i][1] && user[2] <= sec[i][2]){
			user[1] = sec[i][0];
		};
	};
	change = Math.round(ch/2.5);
	for(i=0; i<5; i++){
		neighbours[i][2] = neighbours[i][2] - change;
		if(neighbours[i][2] > sec[0][2]){
			neighbours[i][1] = sec[0][0];
		}
		else{
			for(j=0; j<6; j++){
				if(neighbours[i][2] >= sec[j][1] && neighbours[i][2] <= sec[j][2]){
					neighbours[i][1] = sec[j][0];
				};
			};
		};
	};
};

//controls visualizations, dependent on whatever else is happening with other functions
function displayInfo(){
	document.getElementById("user_class").innerHTML = "Class: " + user[1];
	document.getElementById("user_income").innerHTML = "Income: " + user[2];
	document.getElementById("meas").style.backgroundImage = "url('"+user[1]+" Mes.png')";
	document.getElementById("house1").style.backgroundImage = "url('"+user[1]+".png')";
	document.getElementById("house2").style.backgroundImage = "url('"+neighbours[0][1]+".png')";
	document.getElementById("house3").style.backgroundImage = "url('"+neighbours[1][1]+".png')";
	document.getElementById("house4").style.backgroundImage = "url('"+neighbours[2][1]+".png')";
	document.getElementById("house5").style.backgroundImage = "url('"+neighbours[3][1]+".png')";
	document.getElementById("house6").style.backgroundImage = "url('"+neighbours[4][1]+".png')";
	document.getElementById("household1").innerHTML = user[0];
	document.getElementById("household2").innerHTML = neighbours[0][0];
	document.getElementById("household3").innerHTML = neighbours[1][0];
	document.getElementById("household4").innerHTML = neighbours[2][0];
	document.getElementById("household5").innerHTML = neighbours[3][0];
	document.getElementById("household6").innerHTML = neighbours[4][0];
	if(property_button == 6){
  		document.getElementById("household_classincome").innerHTML = user[1] + " Income";
  		if(playing == false){
  			document.getElementById("property_objects").innerHTML ="<img src='"+user[1]+" Objects.png' style='object-fit: contain'>";
			if(user[1] != "Extremely Low"){
				document.getElementById("tv_button").style.visibility = "visible";
			}
			else{
				document.getElementById("tv_button").style.visibility = "hidden";
			};
  		}
  		else{
  			if(user[1] == "Extremely Low"){
				document.getElementById("property_objects").innerHTML ="<img src='"+user[1]+" Objects.png'>";
				document.getElementById("tv_button").style.visibility = "hidden";
			};
  		};
  	}
  	else if(property_button > -1){
  		document.getElementById("household_classincome").innerHTML = neighbours[property_button][1] + " Income";
  		document.getElementById("property_objects").innerHTML ="<img src='"+neighbours[property_button][1]+" Objects.png'>";
  		document.getElementById("tv_button").style.visibility = "hidden";
  	};
	if(job_available == true && obstacle == ""){
		document.getElementById("coin").style.backgroundImage = "url('coin.png')";
		for(i=0; i<5; i++){
  			if(user[1] == secClicks[i][0]){
  				job_points = secClicks[i][1];
  			};
  		};
		document.getElementById("job_points").style.color = "black";
		document.getElementById("job_points").innerHTML = "Goal: "+job_points+" clicks";
		document.getElementById("job_clicks").style.color = "black";
		document.getElementById("job_clicks").innerHTML = "Clicks: "+job_clicks;
		document.getElementById("job_points").style.visibility = "visible";
		document.getElementById("job_clicks").style.visibility = "visible";
		if(job_alert == true){
			document.getElementById("job_alert").style.visibility = "visible";
			document.getElementById("job_alert").style.color = "rgb(255, 153, 0)";
			document.getElementById("job_alert").innerHTML = "JOB ALERT!";
		}
		else{
			document.getElementById("job_alert").style.visibility = "hidden";
		};
	}
	else if(job_available == true && obstacle == "debt"){
		document.getElementById("coin").style.backgroundImage = "url('debtcoin.png')";
		for(i=0; i<5; i++){
  			if(user[1] == secClicks[i][0]){
  				job_points = secClicks[i][1];
  			};
  		};
		document.getElementById("job_points").style.color = "black";
		document.getElementById("job_points").innerHTML = "Goal: "+job_points+" clicks";
		document.getElementById("job_clicks").style.color = "black";
		document.getElementById("job_clicks").innerHTML = "Clicks: "+job_clicks;
		document.getElementById("job_points").style.visibility = "visible";
		document.getElementById("job_clicks").style.visibility = "visible";
		if(job_alert == true){
			document.getElementById("job_alert").style.visibility = "visible";
			document.getElementById("job_alert").style.color = "rgb(255, 153, 0)";
			document.getElementById("job_alert").innerHTML = "JOB ALERT!";
		}
		else{
			document.getElementById("job_alert").style.visibility = "hidden";
		};
	}
	else if(job_available == true && obstacle == "disease"){
		document.getElementById("coin").style.backgroundImage = "url('sickcoin.png')";
		for(i=0; i<5; i++){
  			if(user[1] == secClicks[i][0]){
  				job_points = secClicks[i][1];
  			};
  		};
		document.getElementById("job_points").style.color = "black";
		document.getElementById("job_points").innerHTML = "Goal: "+job_points+" clicks";
		document.getElementById("job_clicks").style.color = "black";
		document.getElementById("job_clicks").innerHTML = "Clicks: "+job_clicks;
		document.getElementById("job_points").style.visibility = "visible";
		document.getElementById("job_clicks").style.visibility = "visible";
		if(job_alert == true){
			document.getElementById("job_alert").style.visibility = "visible";
			document.getElementById("job_alert").style.color = "rgb(255, 153, 0)";
			document.getElementById("job_alert").innerHTML = "JOB ALERT!";
		}
		else{
			document.getElementById("job_alert").style.visibility = "hidden";
		};
	}
	else{
		document.getElementById("coin").style.backgroundImage = "url('nocoin.png')";
		document.getElementById("job_alert").style.visibility = "hidden";
		document.getElementById("job_points").style.visibility = "hidden";
		document.getElementById("job_clicks").style.visibility = "hidden";
	};
	if(obstacle == "debt"){
		document.getElementById("obstacle").style.color = "red";
		document.getElementById("obstacle").innerHTML = "Obstacle: Debt";
	}
	else if(obstacle == "disease"){
		document.getElementById("obstacle").style.color = "red";
		document.getElementById("obstacle").innerHTML = "Obstacle: Disease";
	}
	else{
		document.getElementById("obstacle").style.color = "black";
		document.getElementById("obstacle").innerHTML = "No Obstacles";
	};
};

//counter for user's clicks on the coin button
function clicks(){
		job_clicks++;
};

//shows objects owned by user or other household when player clicks on a house
function showObjects(h){
	document.getElementById("property").style.visibility = "visible";
	if(h == 1){
		property_button = 6;
		playing = false;
		document.getElementById("household_name").innerHTML = user[0];
	}
	else{
		property_button = h - 2;
		playing = false;
		document.getElementById("household_name").innerHTML = neighbours[h-2][0];
	};
};

//selects YouTube playlist to be shown according to the user's income level, when the user clicks on her/his own TV
function tvOn(){
	playing = true;
	if(user[1] == "Low"){
		document.getElementById("property_objects").innerHTML = "<iframe width='288' height='162' src='https://www.youtube.com/embed/videoseries?list=PL1A77A1E6ECC26976' frameborder='0' allowfullscreen></iframe>";
	}
	else if(user[1] == "Lower Middle"){
	document.getElementById("property_objects").innerHTML = "<iframe width='288' height='162' src='https://www.youtube.com/embed/videoseries?list=PL5D3BFF118D8928BC' frameborder='0' allowfullscreen></iframe>";
	}
	else if(user[1] == "Middle"){
	document.getElementById("property_objects").innerHTML = "<iframe width='288' height='162' src='https://www.youtube.com/embed/videoseries?list=PLZ1f3amS4y1ffYEhGZDtawaEyRQQu69Bw' frameborder='0' allowfullscreen></iframe>";
	}
	else if(user[1] == "Upper Middle"){
	document.getElementById("property_objects").innerHTML = "<iframe width='288' height='162' src='https://www.youtube.com/embed/Q5bhYdr1gps?list=PLBLTNWMyOvmkTqnu1yDjYjQEomaAZe24G' frameborder='0' allowfullscreen></iframe>";
	};
};

//opens winning page
function win(){
	window.location="winner.html";
};

//if user clicks x button, question about suicide pops up
function quit(){
	quit_botton = true;
	document.getElementById("question_suicide").style.visibility = "visible";
	document.getElementById("question_yes").style.visibility = "visible";
	document.getElementById("question_no").style.visibility = "visible";
	document.getElementById("x").style.opacity = 0.3;
	document.getElementById("grid").style.opacity = 0.3;
	document.getElementById("coin").style.opacity = 0.3;
	document.getElementById("game_name").style.opacity = 0.3;
	document.getElementById("goal").style.opacity = 0.3;
	document.getElementById("upper_left").style.opacity = 0.3;
	document.getElementById("lower_left").style.opacity = 0.3;
	document.getElementById("upper_right").style.opacity = 0.3;
};

//if user "wants to commit suicide," opens google search "suicide+poverty" 
function quitYes(){
	if(quit_botton == true){
		window.location="https://www.google.com/#q=suicide%20%2B%20poverty";
	};
};

function quitNo(){
	if(quit_botton == true){
		document.getElementById("question_suicide").style.visibility = "hidden";
		document.getElementById("question_yes").style.visibility = "hidden";
		document.getElementById("question_no").style.visibility = "hidden";
		document.getElementById("x").style.opacity = 1;
		document.getElementById("grid").style.opacity = 1;
		document.getElementById("coin").style.opacity = 1;
		document.getElementById("game_name").style.opacity = 1;
		document.getElementById("goal").style.opacity = 1;
	document.getElementById("upper_left").style.opacity = 1;
	document.getElementById("lower_left").style.opacity = 1;
	document.getElementById("upper_right").style.opacity = 1;
	};
	quit_botton = false;
};

//initiates game, both from starting page and from winning page
function playAgain(){
	window.location="game.html";
};

assignAll();
timer = setInterval(checkTime, 100);
informer = setInterval(displayInfo, 100);
clicker = setInterval(checkClicks, 30000);
