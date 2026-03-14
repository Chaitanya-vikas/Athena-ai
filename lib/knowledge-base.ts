/**
 * Ed-Tech Knowledge Base
 * 
 * A curated collection of educational documents used for RAG retrieval.
 * Each document has an id, title, category, and content.
 */

export interface KBDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

export const knowledgeBase: KBDocument[] = [
  // ─── STUDY TECHNIQUES ──────────────────────────────────────────────────────
  {
    id: "st-001",
    title: "Spaced Repetition",
    category: "Study Techniques",
    tags: ["memory", "review", "retention", "flashcards", "anki"],
    content: `Spaced repetition is a learning technique where you review information at increasing intervals over time. The core idea is to revisit material just before you're about to forget it, which dramatically strengthens long-term memory.

Review schedule: 1 day → 3 days → 7 days → 14 days → 30 days → 90 days.

Benefits: Reduces total study time by 50-70% compared to massed practice, greatly improves long-term retention, especially effective for factual information like vocabulary, dates, and formulas.

Tools: Anki (free, open-source), SuperMemo, Quizlet, RemNote all implement spaced repetition algorithms. Anki is highly recommended because it adapts intervals based on how well you recall each card.

How to start: Create flashcards for key concepts, formulas, vocabulary, and facts. Review your deck daily for 15-20 minutes. Be honest about your recall — only mark a card correct if you recalled it confidently.`,
  },
  {
    id: "st-002",
    title: "Active Recall",
    category: "Study Techniques",
    tags: ["memory", "recall", "testing", "study", "learning"],
    content: `Active recall (also called retrieval practice) means testing yourself on material instead of passively re-reading or highlighting. It is consistently rated as one of the most effective learning strategies in educational psychology research.

Why it works: Each time you retrieve a memory, you strengthen the neural pathway for that information. Struggling to recall something makes the memory stronger when you do retrieve it.

Methods:
- Close your notes and write down everything you remember about a topic
- Use flashcards (without peeking)
- Answer practice problems and past exam questions
- Explain concepts out loud without looking at notes
- Use the "blank page" method: write everything you know about a topic from memory

Studies show that students who use active recall score 50% higher on tests than students who simply re-read material for the same amount of time.`,
  },
  {
    id: "st-003",
    title: "The Feynman Technique",
    category: "Study Techniques",
    tags: ["understanding", "explanation", "concept", "learning", "feynman"],
    content: `The Feynman Technique is a 4-step learning method developed by physicist Richard Feynman to build genuine understanding, not just surface-level memorization.

Step 1 – Choose a concept: Pick a concept you want to understand.
Step 2 – Teach it like you're explaining to a 12-year-old: Write or say a clear, simple explanation without using jargon. If you can't explain it simply, you don't understand it yet.
Step 3 – Identify gaps: When you get stuck or use vague language, go back to your notes or textbook to fill in the gaps in your understanding.
Step 4 – Simplify and use analogies: Rewrite your explanation using simple language and relate the concept to something familiar.

Why it's powerful: It forces you to confront what you don't actually understand, builds intuition, and makes concepts stick long-term. It's also great exam preparation because you can explain answers clearly under pressure.`,
  },
  {
    id: "st-004",
    title: "Pomodoro Technique",
    category: "Study Techniques",
    tags: ["focus", "productivity", "time management", "pomodoro", "breaks"],
    content: `The Pomodoro Technique is a time management method that uses focused work intervals separated by short breaks.

Basic structure:
1. Set a timer for 25 minutes and work with full focus
2. Take a 5-minute break
3. After 4 "pomodoros", take a longer 15-30 minute break

Why it works: Reduces mental fatigue, combats procrastination, creates urgency (deadlines even small ones boost focus), and makes large tasks feel manageable.

Tips for students:
- Remove all distractions during a pomodoro (phone on airplane mode, website blockers)
- During breaks, move your body — don't scroll social media
- Track how many pomodoros each task takes to improve time estimates
- You can extend intervals to 45-50 minutes once you build focus endurance

Apps: Focus Keeper, Forest, Pomofocus.io, Toggl Track all support Pomodoro.`,
  },
  {
    id: "st-005",
    title: "Mind Mapping",
    category: "Study Techniques",
    tags: ["notes", "visual learning", "concept map", "organization", "brainstorm"],
    content: `Mind mapping is a visual note-taking technique where you organize information around a central concept using branching nodes, colors, and images.

How to create a mind map:
1. Write the main topic in the center of a page
2. Draw branches for major subtopics
3. Add smaller branches for details, examples, and connections
4. Use colors for different categories
5. Add small icons or images to aid memory

Benefits: Mirrors how the brain naturally organizes information associatively, shows relationships between ideas clearly, great for subjects with interconnected concepts (biology, history, literature), and excellent for exam revision.

Best uses: Summarizing a chapter, planning essays, revising for exams, brainstorming, understanding cause-and-effect relationships.

Tools: XMind, MindMeister, Miro, Coggle (all free tiers available).`,
  },
  {
    id: "st-006",
    title: "Cornell Note-Taking System",
    category: "Study Techniques",
    tags: ["notes", "cornell", "review", "summary", "organization"],
    content: `The Cornell Note-Taking System is a structured note-taking method developed at Cornell University that improves organization and retention.

Page layout:
- Right column (main notes, ~70% of page): Write notes during class/reading
- Left column (cue column, ~30% of page): After class, write key questions, keywords, and prompts based on your notes
- Bottom section (summary): Write a 2-3 sentence summary of the page in your own words

The review process: After class, cover the main notes column and use the cue questions to test your recall. This builds active recall into your note review.

Why it works: Forces you to process and organize information twice (once while taking notes, once while writing cues), the cue column provides ready-made study questions, and summaries reinforce the big picture.

Best for: Lectures, textbook chapters, documentary watching, and any content-heavy learning.`,
  },

  // ─── MATHEMATICS ────────────────────────────────────────────────────────────
  {
    id: "math-001",
    title: "Algebra Fundamentals",
    category: "Mathematics",
    tags: ["algebra", "equations", "variables", "solving", "math"],
    content: `Algebra is the branch of mathematics that uses symbols (usually letters) to represent numbers and express relationships.

Key concepts:
- Variables: Letters like x, y, n that stand for unknown numbers
- Expressions: Combinations of variables and numbers (e.g., 3x + 5)
- Equations: Statements that two expressions are equal (e.g., 3x + 5 = 14)
- Solving equations: Finding the value of the variable that makes the equation true

Solving linear equations (balance method):
1. Perform the same operation on both sides to keep the equation balanced
2. Goal: isolate the variable on one side
Example: 3x + 5 = 14 → 3x = 9 → x = 3

Order of Operations (PEMDAS/BODMAS):
Parentheses/Brackets → Exponents/Orders → Multiplication/Division → Addition/Subtraction
Always work left to right for same-priority operations.

Factoring: Expressing an expression as a product of its factors.
Example: x² + 5x + 6 = (x + 2)(x + 3)

Quadratic formula: For ax² + bx + c = 0, x = (-b ± √(b²-4ac)) / 2a`,
  },
  {
    id: "math-002",
    title: "Calculus: Derivatives and Integrals",
    category: "Mathematics",
    tags: ["calculus", "derivative", "integral", "differentiation", "integration", "math"],
    content: `Calculus is the mathematics of change and accumulation. It has two main branches: differential calculus (derivatives) and integral calculus (integrals).

DERIVATIVES (rate of change):
The derivative f'(x) represents the instantaneous rate of change of f(x) at any point.
Geometrically: the slope of the tangent line to the curve at that point.

Basic derivative rules:
- Power rule: d/dx[xⁿ] = nxⁿ⁻¹
- Constant rule: d/dx[c] = 0
- Sum rule: d/dx[f+g] = f' + g'
- Product rule: d/dx[fg] = f'g + fg'
- Chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)

Common derivatives: d/dx[sin x] = cos x, d/dx[cos x] = -sin x, d/dx[eˣ] = eˣ, d/dx[ln x] = 1/x

INTEGRALS (accumulation/area):
The integral ∫f(x)dx represents the area under the curve f(x).

Basic integral rules:
- Power rule: ∫xⁿdx = xⁿ⁺¹/(n+1) + C (n ≠ -1)
- ∫eˣdx = eˣ + C
- ∫sin x dx = -cos x + C
- ∫cos x dx = sin x + C

Fundamental Theorem of Calculus: The definite integral ∫ₐᵇ f(x)dx = F(b) - F(a), where F is the antiderivative of f.`,
  },
  {
    id: "math-003",
    title: "Statistics and Probability",
    category: "Mathematics",
    tags: ["statistics", "probability", "mean", "median", "standard deviation", "data"],
    content: `Statistics is the science of collecting, analyzing, interpreting, and presenting data. Probability is the measure of likelihood that an event will occur.

DESCRIPTIVE STATISTICS:
- Mean (average): Sum of all values ÷ number of values
- Median: Middle value when data is sorted. For even n, average the two middle values.
- Mode: Most frequently occurring value
- Range: Maximum - Minimum
- Standard deviation: Measures how spread out data is from the mean. Low SD = data clustered near mean; high SD = data spread out.
- Variance: Standard deviation squared

PROBABILITY:
- P(event) = (favorable outcomes) / (total outcomes). Values range from 0 (impossible) to 1 (certain).
- Complementary rule: P(not A) = 1 - P(A)
- Addition rule: P(A or B) = P(A) + P(B) - P(A and B)
- Multiplication rule (independent events): P(A and B) = P(A) × P(B)
- Conditional probability: P(A|B) = P(A and B) / P(B)

DISTRIBUTIONS:
- Normal distribution: Bell-shaped, symmetric. 68% of data within 1 SD, 95% within 2 SD, 99.7% within 3 SD (empirical rule).
- Binomial distribution: For n independent trials, each with probability p of success.`,
  },
  {
    id: "math-004",
    title: "Geometry Essentials",
    category: "Mathematics",
    tags: ["geometry", "shapes", "area", "volume", "angles", "triangles", "circles"],
    content: `Geometry deals with shapes, sizes, and properties of figures and spaces.

ANGLES:
- Acute: < 90°, Right: = 90°, Obtuse: 90°-180°, Straight: = 180°
- Complementary angles sum to 90°, supplementary angles sum to 180°

TRIANGLES:
- Sum of interior angles = 180°
- Area = ½ × base × height
- Pythagorean theorem (right triangles): a² + b² = c² (c = hypotenuse)
- Similar triangles have equal angles and proportional sides

QUADRILATERALS:
- Rectangle: area = length × width, perimeter = 2(l+w)
- Square: area = s², perimeter = 4s
- Parallelogram: area = base × height
- Trapezoid: area = ½(b₁ + b₂) × height

CIRCLES:
- Circumference = 2πr = πd
- Area = πr²
- Arc length = (θ/360) × 2πr

3D SHAPES:
- Cube: volume = s³, surface area = 6s²
- Rectangular prism: V = lwh, SA = 2(lw + lh + wh)
- Cylinder: V = πr²h, SA = 2πr² + 2πrh
- Sphere: V = (4/3)πr³, SA = 4πr²`,
  },

  // ─── SCIENCE ────────────────────────────────────────────────────────────────
  {
    id: "bio-001",
    title: "Cell Biology Basics",
    category: "Biology",
    tags: ["cell", "biology", "organelles", "nucleus", "mitochondria", "membrane"],
    content: `The cell is the fundamental unit of life. All living organisms are made of one or more cells.

CELL TYPES:
- Prokaryotic cells: No membrane-bound nucleus (bacteria, archaea). DNA floats in cytoplasm.
- Eukaryotic cells: Have a membrane-bound nucleus (plants, animals, fungi, protists).

KEY ORGANELLES (eukaryotes):
- Nucleus: Control center; contains DNA with genetic instructions
- Mitochondria: "Powerhouse of the cell" — produces ATP through cellular respiration
- Ribosomes: Synthesize proteins; found on rough ER and floating in cytoplasm
- Endoplasmic Reticulum (ER): Rough ER (with ribosomes) processes proteins; smooth ER processes lipids
- Golgi apparatus: Packages and ships proteins/lipids; like the cell's post office
- Lysosomes: Contain digestive enzymes; break down waste materials
- Cell membrane: Phospholipid bilayer that controls what enters/exits the cell
- Cell wall (plants only): Rigid outer layer for structure and support
- Chloroplasts (plants only): Site of photosynthesis; contain chlorophyll

CELL PROCESSES:
- Osmosis: Movement of water across a semipermeable membrane from low to high solute concentration
- Diffusion: Movement of molecules from high to low concentration (no energy required)
- Active transport: Movement against concentration gradient (requires ATP energy)`,
  },
  {
    id: "bio-002",
    title: "DNA, Genes, and Heredity",
    category: "Biology",
    tags: ["dna", "genetics", "heredity", "genes", "chromosomes", "mendel", "alleles"],
    content: `DNA (deoxyribonucleic acid) carries the genetic instructions for all living organisms.

DNA STRUCTURE:
- Double helix: Two strands wound around each other
- Made of nucleotides: each has a sugar (deoxyribose), phosphate group, and one of 4 bases
- Bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C)
- Base pairing rules: A pairs with T, G pairs with C

FROM DNA TO PROTEIN:
1. Transcription: DNA → mRNA (in the nucleus)
2. Translation: mRNA → protein (at ribosomes)
Codons: 3-base sequences on mRNA that code for specific amino acids

MENDELIAN GENETICS:
- Gene: A segment of DNA that codes for a trait
- Alleles: Different versions of the same gene
- Dominant allele (uppercase letter): Expressed when present
- Recessive allele (lowercase letter): Only expressed when two copies present
- Genotype: Genetic makeup (e.g., Bb, BB, bb)
- Phenotype: Observable physical trait
- Homozygous: Two identical alleles (BB or bb)
- Heterozygous: Two different alleles (Bb)

Punnett squares: Used to predict offspring genotype/phenotype ratios.
For Bb × Bb cross: 25% BB, 50% Bb, 25% bb → 75% dominant phenotype, 25% recessive`,
  },
  {
    id: "chem-001",
    title: "Atomic Structure and the Periodic Table",
    category: "Chemistry",
    tags: ["atoms", "chemistry", "periodic table", "electrons", "protons", "neutrons", "elements"],
    content: `An atom is the smallest unit of an element that retains the properties of that element.

ATOMIC STRUCTURE:
- Nucleus: Contains protons (+ charge) and neutrons (no charge). Very dense, very small.
- Electrons: Negatively charged particles orbiting the nucleus in shells/energy levels

ATOMIC NUMBERS:
- Atomic number = number of protons (identifies the element)
- Mass number = protons + neutrons
- Neutral atom: protons = electrons

ELECTRON CONFIGURATION:
- Shell 1 holds max 2 electrons
- Shell 2 holds max 8 electrons
- Shell 3 holds max 18 electrons
- Valence electrons (outermost shell) determine chemical behavior

PERIODIC TABLE:
- Arranged by increasing atomic number
- Periods (rows): Elements in the same period have the same number of electron shells
- Groups (columns): Elements in the same group have the same number of valence electrons and similar properties
- Metals (left side): Good conductors, malleable, lose electrons easily
- Non-metals (right side): Poor conductors, gain electrons
- Metalloids (diagonal dividing line): Properties of both metals and non-metals
- Noble gases (Group 18): Full outer shell, very unreactive

Isotopes: Atoms of the same element with different numbers of neutrons (same atomic number, different mass number).`,
  },
  {
    id: "phys-001",
    title: "Newton's Laws of Motion",
    category: "Physics",
    tags: ["physics", "newton", "motion", "force", "acceleration", "momentum", "laws"],
    content: `Newton's three laws of motion form the foundation of classical mechanics.

FIRST LAW (Law of Inertia):
"An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external net force."
Inertia: The resistance of an object to changes in its motion. Mass is a measure of inertia.
Example: A passenger lurches forward when a car brakes suddenly.

SECOND LAW (F = ma):
"The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass."
Formula: F = ma (Force = mass × acceleration)
Units: Force in Newtons (N), mass in kg, acceleration in m/s²
Example: The same force applied to a lighter object produces greater acceleration.

THIRD LAW (Action-Reaction):
"For every action, there is an equal and opposite reaction."
The two forces act on DIFFERENT objects.
Example: A rocket pushes exhaust gases backward; the gases push the rocket forward.

IMPORTANT DERIVED CONCEPTS:
- Weight: W = mg (mass × gravitational acceleration, 9.8 m/s² on Earth)
- Momentum: p = mv (mass × velocity)
- Impulse: J = FΔt = Δp (change in momentum)
- Work: W = Fd cos θ
- Kinetic energy: KE = ½mv²
- Gravitational potential energy: PE = mgh`,
  },
  {
    id: "phys-002",
    title: "Electricity and Circuits",
    category: "Physics",
    tags: ["electricity", "circuits", "voltage", "current", "resistance", "ohm", "physics"],
    content: `Electricity is the flow of electric charge, typically electrons, through a conductor.

KEY CONCEPTS:
- Electric charge: Property of matter; positive (+) or negative (-). Like charges repel, opposite charges attract.
- Current (I): Rate of charge flow, measured in Amperes (A). I = Q/t
- Voltage (V): Electric potential difference (like electrical pressure), measured in Volts (V)
- Resistance (R): Opposition to current flow, measured in Ohms (Ω)

OHM'S LAW: V = IR
If you know two of the three quantities, you can find the third.

POWER: P = IV = I²R = V²/R (measured in Watts)

SERIES CIRCUITS:
- Components connected end-to-end in a single path
- Same current flows through all components
- Total resistance: Rₜ = R₁ + R₂ + R₃
- Total voltage: Vₜ = V₁ + V₂ + V₃
- If one component fails, the whole circuit breaks

PARALLEL CIRCUITS:
- Components connected across the same two points (multiple paths)
- Same voltage across all components
- Total resistance: 1/Rₜ = 1/R₁ + 1/R₂ + 1/R₃ (total R is less than smallest R)
- Current splits between branches
- If one component fails, others continue to work (household wiring uses parallel circuits)`,
  },

  // ─── PROGRAMMING ────────────────────────────────────────────────────────────
  {
    id: "prog-001",
    title: "Programming Fundamentals",
    category: "Computer Science",
    tags: ["programming", "coding", "variables", "loops", "functions", "algorithms", "computer science"],
    content: `Programming is the process of writing instructions for a computer to execute.

CORE CONCEPTS:

Variables: Named storage locations that hold data.
  x = 5 (integer), name = "Alice" (string), pi = 3.14 (float), isValid = True (boolean)

Data Types: int, float, string, boolean, list/array, dictionary/object

Control Flow:
  If/else: Execute code conditionally
    if x > 10: print("big") else: print("small")
  Loops: Repeat code
    for i in range(5): print(i)  # prints 0,1,2,3,4
    while condition: # repeat as long as condition is true

Functions: Reusable blocks of code
  def greet(name):
    return "Hello, " + name
  print(greet("Alice"))  # prints "Hello, Alice"

Data Structures:
  - Arrays/Lists: Ordered collection [1, 2, 3]
  - Dictionaries/Objects: Key-value pairs {"name": "Alice", "age": 20}
  - Stacks: LIFO (last in, first out)
  - Queues: FIFO (first in, first out)

Big O Notation: Describes algorithm efficiency
  O(1): Constant time, O(n): Linear, O(n²): Quadratic, O(log n): Logarithmic (efficient)`,
  },
  {
    id: "prog-002",
    title: "Python Basics",
    category: "Computer Science",
    tags: ["python", "programming", "syntax", "beginners", "coding", "scripting"],
    content: `Python is a beginner-friendly, high-level programming language known for its readable syntax.

SYNTAX BASICS:
  # This is a comment
  print("Hello, World!")  # Output text
  
  # Variables (no type declaration needed)
  age = 20
  name = "Alice"
  gpa = 3.8
  is_student = True

LISTS:
  fruits = ["apple", "banana", "cherry"]
  fruits.append("mango")  # Add item
  fruits[0]  # Access first item: "apple"
  len(fruits)  # Length: 4

DICTIONARIES:
  student = {"name": "Alice", "grade": 10, "gpa": 3.8}
  student["name"]  # "Alice"
  student["age"] = 16  # Add new key

LIST COMPREHENSIONS (Python superpower):
  squares = [x**2 for x in range(10)]  # [0, 1, 4, 9, 16, ...]

FILE I/O:
  with open("file.txt", "r") as f:
    content = f.read()

COMMON BUILT-IN FUNCTIONS:
  len(), range(), type(), int(), str(), float(), list(), dict(), sorted(), zip(), enumerate(), map(), filter()

USEFUL LIBRARIES:
  math, random, datetime, os, sys, json, re (regex), requests (web), numpy (numbers), pandas (data)`,
  },

  // ─── HISTORY ────────────────────────────────────────────────────────────────
  {
    id: "hist-001",
    title: "World War II Overview",
    category: "History",
    tags: ["world war", "ww2", "history", "nazi", "holocaust", "allies", "axis"],
    content: `World War II (1939-1945) was the deadliest conflict in human history, involving most of the world's nations.

CAUSES:
- Rise of fascism and Nazism in Europe (Hitler in Germany, Mussolini in Italy)
- Failure of appeasement policy by Britain and France
- German resentment of the Treaty of Versailles (end of WWI)
- Japanese imperial expansion in Asia and the Pacific
- Global economic depression increasing political extremism

MAJOR EVENTS:
- 1939: Germany invades Poland; UK and France declare war on Germany
- 1940: Fall of France; Battle of Britain (Germany's air campaign against UK)
- 1941: Germany invades the Soviet Union (Operation Barbarossa); Japan attacks Pearl Harbor; USA enters war
- 1942: Battle of Stalingrad (turning point on Eastern Front); Battle of Midway (Pacific turning point)
- 1944: D-Day (June 6) — Allied invasion of Normandy, France
- 1945: Germany surrenders (May); Atomic bombs dropped on Hiroshima and Nagasaki; Japan surrenders (September)

THE HOLOCAUST:
Systematic genocide by Nazi Germany of six million Jews and millions of others (Roma, disabled people, political opponents, LGBTQ+ people).

AFTERMATH:
- ~70-85 million deaths total (military and civilian)
- United Nations founded to prevent future conflicts
- Cold War between USA and USSR begins
- Nuremberg Trials held Nazi leaders accountable for war crimes`,
  },

  // ─── WRITING ────────────────────────────────────────────────────────────────
  {
    id: "write-001",
    title: "Essay Writing Structure",
    category: "English & Writing",
    tags: ["writing", "essay", "thesis", "paragraph", "introduction", "conclusion", "english"],
    content: `A well-structured essay clearly communicates ideas and arguments in an organized, logical way.

THE 5-PARAGRAPH ESSAY STRUCTURE:
1. Introduction (Hook → Background → Thesis statement)
2. Body Paragraph 1 (Topic sentence → Evidence → Analysis → Transition)
3. Body Paragraph 2 (Topic sentence → Evidence → Analysis → Transition)
4. Body Paragraph 3 (Topic sentence → Evidence → Analysis → Transition)
5. Conclusion (Restate thesis → Summarize main points → Broader significance)

THE THESIS STATEMENT:
The most important sentence in your essay. It states your main argument and tells the reader what the essay will prove.
Good thesis: "While social media has increased global connectivity, it has simultaneously created an epidemic of anxiety and depression among teenagers due to comparison culture and sleep disruption."
Weak thesis: "Social media has good and bad effects." (Too vague — no specific argument)

BODY PARAGRAPHS (PEEL structure):
- Point: State the paragraph's main idea (topic sentence)
- Evidence: Provide specific evidence (quote, statistic, example)
- Explanation: Explain HOW your evidence supports your point
- Link: Connect back to your thesis

COMMON ESSAY TYPES:
- Argumentative: Take a position and defend it with evidence
- Expository: Explain a topic objectively
- Narrative: Tell a story to make a point
- Comparative: Analyze similarities and differences between two subjects`,
  },
];

/** All available categories in the knowledge base */
export const categories = [...new Set(knowledgeBase.map((doc) => doc.category))];
