const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Quiz.deleteMany();
    await Attempt.deleteMany();

    console.log('Database cleared.');

    // Create a demo admin/creator user
    const creator = await User.create({
      username: 'QuizMaster',
      email: 'creator@quizapp.com',
      password: 'password123', // Will be hashed via pre-save hook
      xp: 1500,
      quizzesTaken: 12,
      accuracy: 85,
      isAdmin: true
    });

    console.log(`Creator user created: ${creator.username}`);

    const quizzes = [
      {
        title: 'JavaScript Mastermind',
        description: 'Test your knowledge on core JavaScript principles, variables, scopes, and asynchronous operations.',
        category: 'JavaScript',
        difficulty: 'Medium',
        creator: creator._id,
        questions: [
          {
            questionText: 'What is the output of "typeof null" in JavaScript?',
            options: ['"object"', '"null"', '"undefined"', '"function"'],
            correctAnswerIndex: 0,
            points: 10,
            timeLimit: 15,
            explanation: 'In JavaScript, typeof null returns "object", which is a historical bug in the language implementation.'
          },
          {
            questionText: 'Which method is used to serialize a JavaScript object to a JSON string?',
            options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'JSON.serialize()'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'JSON.stringify() converts a JavaScript object or value to a JSON string.'
          },
          {
            questionText: 'What is the primary purpose of Promise.all()?',
            options: [
              'Resolves all promises sequentially one by one',
              'Resolves when the first promise in the array resolves',
              'Resolves when all promises resolve, or rejects when any promise rejects',
              'Catches all errors within a block of promises'
            ],
            correctAnswerIndex: 2,
            points: 15,
            timeLimit: 20,
            explanation: 'Promise.all() takes an iterable of promises and returns a single Promise that resolves when all of the inputs resolve, or rejects if any input rejects.'
          },
          {
            questionText: 'Which of the following is NOT a JavaScript framework or library?',
            options: ['React', 'Angular', 'Django', 'Vue'],
            correctAnswerIndex: 2,
            points: 10,
            timeLimit: 15,
            explanation: 'Django is a high-level Python web framework, whereas React, Angular, and Vue are JavaScript front-end libraries/frameworks.'
          },
          {
            questionText: 'What is the scope of a variable declared with "let"?',
            options: ['Global scope', 'Function scope', 'Block scope', 'Lexical scope'],
            correctAnswerIndex: 2,
            points: 10,
            timeLimit: 15,
            explanation: 'Variables declared with let (and const) are block-scoped, meaning they are only accessible within the enclosing curly braces {}.'
          }
        ]
      },
      {
        title: 'Space & The Cosmos',
        description: 'Explore the boundaries of outer space, celestial bodies, and the physics of the universe.',
        category: 'Science',
        difficulty: 'Hard',
        creator: creator._id,
        questions: [
          {
            questionText: 'Approximately how long does it take for light from the Sun to reach Earth?',
            options: ['8 seconds', '8 minutes', '8 hours', '8 days'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'Light travels at ~300,000 km/s. The average distance to the Sun is ~150 million km, taking light about 8 minutes and 20 seconds to arrive.'
          },
          {
            questionText: 'What is the largest planet in our solar system?',
            options: ['Saturn', 'Earth', 'Jupiter', 'Neptune'],
            correctAnswerIndex: 2,
            points: 10,
            timeLimit: 15,
            explanation: 'Jupiter is the largest planet in our solar system, with a mass more than two and a half times that of all other planets combined.'
          },
          {
            questionText: 'Which galaxy is closest to our Milky Way galaxy?',
            options: ['Andromeda', 'Triangulum', 'Sombrero', 'Large Magellanic Cloud'],
            correctAnswerIndex: 0,
            points: 15,
            timeLimit: 20,
            explanation: 'Andromeda (M31) is the closest spiral galaxy to the Milky Way, located about 2.5 million light-years away.'
          },
          {
            questionText: 'What is the boundary surrounding a black hole from which nothing can escape?',
            options: ['Singularity', 'Event Horizon', 'Accretion Disk', 'Schwarzschild Radius'],
            correctAnswerIndex: 1,
            points: 15,
            timeLimit: 20,
            explanation: 'The event horizon is the threshold around a black hole where the escape velocity exceeds the speed of light.'
          },
          {
            questionText: 'What physical force holds galaxies together?',
            options: ['Electromagnetism', 'Gravity', 'Strong Nuclear Force', 'Weak Nuclear Force'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'Gravity is the long-range attractive force that binds stars, gas, dust, and dark matter into galaxy systems.'
          }
        ]
      },
      {
        title: 'World Wonders & History',
        description: 'Test your recollection of major human achievements, ancient structures, and pivotal historic events.',
        category: 'History',
        difficulty: 'Easy',
        creator: creator._id,
        questions: [
          {
            questionText: 'In which modern-day country are the ancient Pyramids of Giza located?',
            options: ['Greece', 'Egypt', 'Italy', 'Mexico'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'The Great Pyramid of Giza is located near Cairo, Egypt, built during the Old Kingdom.'
          },
          {
            questionText: 'Who was the first President of the United States?',
            options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'George Washington served as the first U.S. President from 1789 to 1797.'
          },
          {
            questionText: 'The ancient city of Pompeii was destroyed by the eruption of which volcano in 79 AD?',
            options: ['Mount Etna', 'Mount Vesuvius', 'Mount St. Helens', 'Mount Krakatoa'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'Pompeii was buried under ash and pumice when Mount Vesuvius erupted.'
          },
          {
            questionText: 'Which empire was ruled by Julius Caesar?',
            options: ['Ottoman Empire', 'Roman Empire', 'British Empire', 'Mongol Empire'],
            correctAnswerIndex: 1,
            points: 10,
            timeLimit: 15,
            explanation: 'Julius Caesar was a Roman general and statesman who led to the rise of the Roman Empire.'
          },
          {
            questionText: 'In what year did World War II end?',
            options: ['1918', '1939', '1945', '1950'],
            correctAnswerIndex: 2,
            points: 10,
            timeLimit: 15,
            explanation: 'World War II ended in 1945 with the formal surrender of Japan on September 2.'
          }
        ]
      }
    ];

    await Quiz.create(quizzes);
    console.log('Sample quizzes seeded.');

    // Seed leaderboard dummy users
    await User.create([
      { username: 'CodeNinja', email: 'ninja@quiz.com', password: 'password123', xp: 1200, quizzesTaken: 10, accuracy: 80 },
      { username: 'Starlight', email: 'star@quiz.com', password: 'password123', xp: 950, quizzesTaken: 8, accuracy: 75 },
      { username: 'RetroPlayer', email: 'retro@quiz.com', password: 'password123', xp: 500, quizzesTaken: 5, accuracy: 65 }
    ]);
    console.log('Dummy leaderboard users seeded.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
