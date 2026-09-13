const bcrypt = require('bcryptjs');

const getHashedPassword = (plain) => {
  return bcrypt.hashSync(plain, 10);
};

const defaultPasswordHash = getHashedPassword('password123');

const initialUsers = [
  {
    _id: 'usr_admin',
    name: 'Admin Hubmaster',
    email: 'admin@quizhub.com',
    password: defaultPasswordHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Lead Administrator & Platform Architect at QuizHub.',
    stats: { quizzesCreated: 12, quizzesTaken: 45, averageScore: 94.2 },
    achievements: ['ach_1', 'ach_2', 'ach_3', 'ach_4', 'ach_5'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@quizhub.com',
    password: defaultPasswordHash,
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    bio: 'Senior Full Stack Developer & Tech Educator.',
    stats: { quizzesCreated: 8, quizzesTaken: 28, averageScore: 89.5 },
    achievements: ['ach_1', 'ach_2', 'ach_3'],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex@quizhub.com',
    password: defaultPasswordHash,
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'AI Researcher & Competitive Programmer.',
    stats: { quizzesCreated: 4, quizzesTaken: 52, averageScore: 92.1 },
    achievements: ['ach_1', 'ach_4', 'ach_5'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'usr_emily',
    name: 'Emily Chen',
    email: 'emily@quizhub.com',
    password: defaultPasswordHash,
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    bio: 'Mathematics Geek & STEM Enthusiast.',
    stats: { quizzesCreated: 2, quizzesTaken: 34, averageScore: 86.8 },
    achievements: ['ach_1', 'ach_2'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'usr_david',
    name: 'David Kim',
    email: 'david@quizhub.com',
    password: defaultPasswordHash,
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    bio: 'CS Student & Quiz Champion.',
    stats: { quizzesCreated: 1, quizzesTaken: 19, averageScore: 78.4 },
    achievements: ['ach_1'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialQuizzes = [
  {
    _id: 'qz_1',
    title: 'Full-Stack Web Development Essentials',
    description: 'Test your understanding of React 19, Node.js, Async JavaScript, REST APIs, and modern CSS architecture.',
    category: 'Web Development',
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    tags: ['React', 'Node.js', 'JavaScript', 'Frontend', 'Backend'],
    timeLimit: 15,
    passingScore: 70,
    visibility: 'Public',
    creator: { _id: 'usr_sarah', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250' },
    attemptsCount: 142,
    averageScore: 82.5,
    rating: 4.9,
    settings: {
      randomizeQuestions: true,
      randomizeAnswers: true,
      showCorrectAnswers: true,
      showExplanations: true,
      allowRetakes: true,
      showLeaderboard: true
    },
    questions: [
      {
        id: 'q_101',
        type: 'MCQ',
        questionText: 'Which React hook is specifically optimized to read and write state stored in local browser storage across renders without extra visual flickers?',
        options: ['useSyncExternalStore', 'useLayoutEffect', 'useEffect', 'useImperativeHandle'],
        correctAnswer: 'useSyncExternalStore',
        points: 10,
        explanation: 'useSyncExternalStore is designed for subscribing to external data sources like browser localStorage safely in React 18+ concurrent rendering.',
        difficulty: 'Intermediate',
        tags: ['React', 'Hooks']
      },
      {
        id: 'q_102',
        type: 'MultiSelect',
        questionText: 'Which of the following are valid HTTP status codes for client-side errors?',
        options: ['400 Bad Request', '401 Unauthorized', '404 Not Found', '502 Bad Gateway', '503 Service Unavailable'],
        correctAnswer: ['400 Bad Request', '401 Unauthorized', '404 Not Found'],
        points: 10,
        explanation: '4xx status codes denote client error responses, while 5xx status codes indicate server errors.',
        difficulty: 'Easy',
        tags: ['HTTP', 'REST']
      },
      {
        id: 'q_103',
        type: 'TrueFalse',
        questionText: 'In Node.js, the Event Loop executes async callbacks on a single main thread by default.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        explanation: 'Node.js relies on an event-driven, non-blocking I/O model using a single-threaded main event loop backed by libuv threadpool for heavy operations.',
        difficulty: 'Easy',
        tags: ['Node.js', 'Async']
      },
      {
        id: 'q_104',
        type: 'FillBlank',
        questionText: 'The modern CSS layout technique that provides a two-dimensional grid system for layout design is called CSS ____.',
        correctAnswer: 'Grid',
        points: 10,
        explanation: 'CSS Grid Layout is a 2D system (rows + columns), whereas Flexbox is primarily 1-dimensional.',
        difficulty: 'Easy',
        tags: ['CSS', 'Frontend']
      },
      {
        id: 'q_105',
        type: 'ImageBased',
        questionText: 'Look at this diagram of the Web Vitals metric stack. Which core Web Vital measures visual loading performance speed?',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        options: ['LCP (Largest Contentful Paint)', 'FID (First Input Delay)', 'CLS (Cumulative Layout Shift)', 'INP (Interaction to Next Paint)'],
        correctAnswer: 'LCP (Largest Contentful Paint)',
        points: 15,
        explanation: 'Largest Contentful Paint (LCP) measures perceived loading speed and marks the point in page load when main content has loaded.',
        difficulty: 'Hard',
        tags: ['Performance', 'Web Vitals']
      }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'qz_2',
    title: 'Modern AI & Machine Learning Fundamentals',
    description: 'Explore neural networks, transformer architectures, LLM fine-tuning, vector databases, and embeddings.',
    category: 'AI & ML',
    difficulty: 'Hard',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    tags: ['AI', 'Machine Learning', 'Transformers', 'Python', 'LLM'],
    timeLimit: 20,
    passingScore: 75,
    visibility: 'Public',
    creator: { _id: 'usr_alex', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
    attemptsCount: 98,
    averageScore: 76.2,
    rating: 4.95,
    settings: {
      randomizeQuestions: true,
      randomizeAnswers: true,
      showCorrectAnswers: true,
      showExplanations: true,
      allowRetakes: true,
      showLeaderboard: true
    },
    questions: [
      {
        id: 'q_201',
        type: 'MCQ',
        questionText: 'What key mechanism introduced in the 2017 landmark paper "Attention Is All You Need" enables Transformers to process text tokens in parallel?',
        options: ['Self-Attention Mechanism', 'Convolutional Layers', 'Recurrent Backpropagation', 'Gradient Clipping'],
        correctAnswer: 'Self-Attention Mechanism',
        points: 10,
        explanation: 'Self-attention allows the model to weigh the importance of different words in a sequence simultaneously without sequential RNN loops.',
        difficulty: 'Hard',
        tags: ['Transformers', 'NLP']
      },
      {
        id: 'q_202',
        type: 'TrueFalse',
        questionText: 'Vector databases store high-dimensional embeddings and use approximate nearest neighbor (ANN) search algorithms like HNSW to retrieve semantically similar items.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        explanation: 'HNSW (Hierarchical Navigable Small World) graphs enable fast sub-millisecond similarity search across millions of vectors.',
        difficulty: 'Intermediate',
        tags: ['VectorDB', 'Embeddings']
      },
      {
        id: 'q_203',
        type: 'ShortAnswer',
        questionText: 'What is the full name of the optimization algorithm commonly abbreviated as "Adam"?',
        correctAnswer: 'Adaptive Moment Estimation',
        points: 15,
        explanation: 'Adam stands for Adaptive Moment Estimation, combining ideas from RMSprop and AdaGrad.',
        difficulty: 'Hard',
        tags: ['Deep Learning', 'Math']
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'qz_3',
    title: 'Data Structures & Algorithms Grandmaster',
    description: 'Master binary search trees, graph algorithms, dynamic programming, and big-O time complexity analysis.',
    category: 'Programming',
    difficulty: 'Hard',
    coverImage: 'https://images.unsplash.com/photo-1516116211223-4c71412e87c0?auto=format&fit=crop&q=80&w=800',
    tags: ['Algorithms', 'DSA', 'Computer Science', 'LeetCode'],
    timeLimit: 25,
    passingScore: 70,
    visibility: 'Public',
    creator: { _id: 'usr_admin', name: 'Admin Hubmaster', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
    attemptsCount: 210,
    averageScore: 68.4,
    rating: 4.88,
    settings: { randomizeQuestions: true, randomizeAnswers: true, showCorrectAnswers: true, showExplanations: true, allowRetakes: true, showLeaderboard: true },
    questions: [
      {
        id: 'q_301',
        type: 'MCQ',
        questionText: 'What is the worst-case time complexity of QuickSort when bad pivot selection occurs on an already sorted array?',
        options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(log N)'],
        correctAnswer: 'O(N^2)',
        points: 10,
        explanation: 'Without random pivot selection, picking the smallest/largest element leads to N recursive calls of size N, resulting in O(N^2).',
        difficulty: 'Intermediate',
        tags: ['Sorting', 'Big-O']
      },
      {
        id: 'q_302',
        type: 'MCQ',
        questionText: 'Which graph algorithm guarantees finding the shortest path in a weighted graph with non-negative edge weights?',
        options: ["Dijkstra's Algorithm", 'Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Kruskal Algorithm'],
        correctAnswer: "Dijkstra's Algorithm",
        points: 10,
        explanation: "Dijkstra's algorithm uses a priority queue to iteratively explore the node with minimum distance.",
        difficulty: 'Intermediate',
        tags: ['Graphs', 'ShortestPath']
      }
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'qz_4',
    title: 'Cybersecurity & Ethical Hacking Challenge',
    description: 'Test your skills on web vulnerability prevention, OAuth 2.0 protocols, JWT security, and encryption standards.',
    category: 'General Knowledge',
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    tags: ['Security', 'OWASP', 'JWT', 'Encryption'],
    timeLimit: 15,
    passingScore: 80,
    visibility: 'Public',
    creator: { _id: 'usr_sarah', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250' },
    attemptsCount: 88,
    averageScore: 81.0,
    rating: 4.75,
    settings: { randomizeQuestions: true, randomizeAnswers: true, showCorrectAnswers: true, showExplanations: true, allowRetakes: true, showLeaderboard: true },
    questions: [
      {
        id: 'q_401',
        type: 'MCQ',
        questionText: 'Which security header prevents clickjacking attacks by dictating whether a browser can render a page inside an iframe?',
        options: ['X-Frame-Options', 'Content-Security-Policy', 'X-XSS-Protection', 'Strict-Transport-Security'],
        correctAnswer: 'X-Frame-Options',
        points: 10,
        explanation: 'X-Frame-Options: DENY or SAMEORIGIN prevents malicious embedding inside hidden frames.',
        difficulty: 'Easy',
        tags: ['Security', 'Headers']
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'qz_5',
    title: 'Quantum Physics & Deep Space Exploration',
    description: 'Challenge your knowledge of particle entanglement, black hole thermodynamics, and cosmic microwave background radiation.',
    category: 'Science',
    difficulty: 'Hard',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    tags: ['Physics', 'Space', 'Quantum', 'Astronomy'],
    timeLimit: 20,
    passingScore: 70,
    visibility: 'Public',
    creator: { _id: 'usr_emily', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250' },
    attemptsCount: 76,
    averageScore: 74.8,
    rating: 4.92,
    settings: { randomizeQuestions: true, randomizeAnswers: true, showCorrectAnswers: true, showExplanations: true, allowRetakes: true, showLeaderboard: true },
    questions: [
      {
        id: 'q_501',
        type: 'MCQ',
        questionText: 'What parameter defines the boundary around a black hole beyond which nothing, not even light, can escape?',
        options: ['Event Horizon', 'Schwarzschild Radius', 'Singularity Point', 'Ergosphere'],
        correctAnswer: 'Event Horizon',
        points: 10,
        explanation: 'The event horizon is the outer boundary where escape velocity equals the speed of light.',
        difficulty: 'Intermediate',
        tags: ['Space', 'BlackHoles']
      }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialQuestionBank = [
  {
    _id: 'qb_1',
    questionText: 'What is the main benefit of using Docker containers in web deployment?',
    type: 'MCQ',
    category: 'Web Development',
    difficulty: 'Easy',
    options: ['Consistent environment isolation across machines', 'Automatic code syntax correction', 'Faster internet bandwidth speed', 'Free cloud server hosting'],
    correctAnswer: 'Consistent environment isolation across machines',
    explanation: 'Containers package application code with dependencies ensuring reproducible behavior on any OS.',
    tags: ['Docker', 'DevOps'],
    creator: 'usr_sarah'
  },
  {
    _id: 'qb_2',
    questionText: 'Evaluate the limit of sin(x)/x as x approaches 0.',
    type: 'MCQ',
    category: 'Mathematics',
    difficulty: 'Intermediate',
    options: ['1', '0', 'Infinity', 'Undefined'],
    correctAnswer: '1',
    explanation: "Using L'Hopital's rule or Taylor series expansion, limit as x->0 of sin(x)/x equals 1.",
    tags: ['Calculus', 'Limits'],
    creator: 'usr_emily'
  },
  {
    _id: 'qb_3',
    questionText: 'In Python, what keyword is used to create a generator function that yields values lazily?',
    type: 'FillBlank',
    category: 'Programming',
    difficulty: 'Easy',
    options: [],
    correctAnswer: 'yield',
    explanation: 'The yield statement suspends function execution and returns a value to the caller, retaining state.',
    tags: ['Python', 'Generators'],
    creator: 'usr_alex'
  },
  {
    _id: 'qb_4',
    questionText: 'Which search algorithm operates in O(log N) on sorted arrays?',
    type: 'MCQ',
    category: 'Aptitude',
    difficulty: 'Easy',
    options: ['Binary Search', 'Linear Search', 'Depth First Search', 'Jump Search'],
    correctAnswer: 'Binary Search',
    explanation: 'Binary search repeatedly divides the search interval in half.',
    tags: ['Algorithms', 'Logic'],
    creator: 'usr_admin'
  }
];

const initialAttempts = [
  {
    _id: 'att_101',
    userId: 'usr_alex',
    userName: 'Alex Rivera',
    quizId: 'qz_1',
    quizTitle: 'Full-Stack Web Development Essentials',
    score: 50,
    totalPoints: 50,
    percentage: 100,
    accuracy: 100,
    timeTaken: 420, // seconds
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      { questionId: 'q_101', userResponse: 'useSyncExternalStore', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_102', userResponse: ['400 Bad Request', '401 Unauthorized', '404 Not Found'], isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_103', userResponse: 'True', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_104', userResponse: 'Grid', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_105', userResponse: 'LCP (Largest Contentful Paint)', isCorrect: true, pointsEarned: 10 }
    ]
  },
  {
    _id: 'att_102',
    userId: 'usr_emily',
    userName: 'Emily Chen',
    quizId: 'qz_1',
    quizTitle: 'Full-Stack Web Development Essentials',
    score: 40,
    totalPoints: 50,
    percentage: 80,
    accuracy: 80,
    timeTaken: 510,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      { questionId: 'q_101', userResponse: 'useEffect', isCorrect: false, pointsEarned: 0 },
      { questionId: 'q_102', userResponse: ['400 Bad Request', '401 Unauthorized', '404 Not Found'], isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_103', userResponse: 'True', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_104', userResponse: 'Grid', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q_105', userResponse: 'LCP (Largest Contentful Paint)', isCorrect: true, pointsEarned: 10 }
    ]
  }
];

const initialAchievements = [
  {
    id: 'ach_1',
    title: 'Quiz Master',
    description: 'Completed 10+ quizzes with a score over 80%',
    badgeIcon: '🏆',
    category: 'Milestone'
  },
  {
    id: 'ach_2',
    title: 'Quiz Streak',
    description: 'Maintained a 7-day daily quiz streak',
    badgeIcon: '🔥',
    category: 'Engagement'
  },
  {
    id: 'ach_3',
    title: 'Knowledge Pro',
    description: 'Created 5+ published quizzes with high ratings',
    badgeIcon: '🧠',
    category: 'Creation'
  },
  {
    id: 'ach_4',
    title: 'Speed Solver',
    description: 'Completed a quiz in under 50% of the allocated time limit',
    badgeIcon: '⚡',
    category: 'Performance'
  },
  {
    id: 'ach_5',
    title: 'Perfect Score',
    description: 'Achieved 100% accuracy on a Hard-difficulty quiz',
    badgeIcon: '🎯',
    category: 'Excellence'
  }
];

const initialNotifications = [
  {
    _id: 'notif_1',
    userId: 'usr_admin',
    title: 'New Quiz Attempt',
    message: 'Alex Rivera scored 100% on "Full-Stack Web Development Essentials"',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    _id: 'notif_2',
    userId: 'usr_admin',
    title: 'Achievement Unlocked!',
    message: 'You unlocked the "Quiz Master" badge!',
    type: 'badge',
    isRead: false,
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString()
  },
  {
    _id: 'notif_3',
    userId: 'usr_admin',
    title: 'Quiz Trending 🔥',
    message: 'Your quiz "AI & Machine Learning Fundamentals" reached 100 attempts!',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString()
  }
];

module.exports = {
  initialUsers,
  initialQuizzes,
  initialQuestionBank,
  initialAttempts,
  initialAchievements,
  initialNotifications
};
