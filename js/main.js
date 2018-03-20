/** Rename vars */
var Neat    = neataptic.Neat;
var Methods = neataptic.Methods;
var Config  = neataptic.Config;
var Architect = neataptic.Architect;

/** Turn off warnings */
Config.warnings = false;

/** Settings */
var POPULATION_SIZE     = 100;
var MAX_GENS     = 20;
var MAX_TRACKS     = 100;
var MUTATION_RATE     = 0.1;
var ELITISM_PERCENT   = 0.3;


// Global vars
var neat, cars;

/** Construct the genetic algorithm */
function initNeat(){
  console.log("main->initNeat()")
  neat = new Neat(
    3,
    2,
    function (unit) {
      console.log("Fitnesas defaultinis!!!!!!!!!!!!!")
      // console.log(unit)
    },
    {
      mutation: [
        Methods.Mutation.ADD_NODE,
        Methods.Mutation.SUB_NODE,
        Methods.Mutation.ADD_CONN,
        Methods.Mutation.SUB_CONN,
        Methods.Mutation.MOD_WEIGHT,
        Methods.Mutation.MOD_BIAS,
        Methods.Mutation.MOD_ACTIVATION,
        Methods.Mutation.ADD_GATE,
        Methods.Mutation.SUB_GATE,
        Methods.Mutation.ADD_SELF_CONN,
        Methods.Mutation.SUB_SELF_CONN,
        Methods.Mutation.ADD_BACK_CONN,
        Methods.Mutation.SUB_BACK_CONN
      ],
      popsize: POPULATION_SIZE,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION_SIZE)
    }
  );
}


/** Start the evaluation of the current generation */
function startEvaluation(){
  // console.log("startEvaluation() with pop size " + neat.population.length)
  cars = [];
  highestScore = 0;
  bestGenome = neat.population[0];

  // Reset car list
  neat.population.forEach(genome =>{
    cars.push(new Car(genome))
  })

  // Generate tracks
  var tracks = [];
  for(var si = 0; si < MAX_TRACKS; si++){
    var newTrack = [1,1,1];
    newTrack[Math.floor(Math.random()*3)] = 0;
    tracks.push(newTrack)
  }

  var si = 0;
  tracks.forEach(track => {
    // console.log("Track ["+si+"]:", track);

    // Loop units
    var gi = 0;
    cars.forEach(car => {
      if (car.isLive)  {
        var output = car.brain.activate(track);

        // Fitness
        var goneThrough = -1;
        var guessPos = null;

        if (output[0] > 0.5) guessPos = 0;
        else if (output[1] > 0.5) guessPos = 2;
        else guessPos = 1;

        if (track[guessPos] == 0) {
          car.brain.score++;
        } else {
          car.isLive = false;
        }
        
        // console.log("[" + gi + "] output: ", output, ", GuessPos: ", guessPos, ", score: ", car.brain.score)

        if (highestScore < car.brain.score) {
          highestScore = car.brain.score
          bestCar = car;
        }
      }
      gi++;
    })     
    si++;
  })

  if (neat.generation < MAX_GENS) endEvaluation();
}

/** End the evaluation of the current generation */
function endEvaluation(){
  console.log('Generation:', neat.generation, '- average score:', neat.getAverage(), " - maxScore: " + highestScore);
  // console.log(bestGenome)

  neat.sort();
  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
  neat.highestScore = 0;
  startEvaluation();
}




// START
initNeat();

// Do some initial mutation
for(var i = 0; i < 100; i++) neat.mutate();

startEvaluation();