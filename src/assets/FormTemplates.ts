import { Category, Form, Question } from "../types/Form";

/**
 * Creates a deterministic TypeID suffix from a template index and item index.
 * Suffixes are 26-char Crockford base32 strings with first char in [0-7].
 * This ensures forms created from the same starter template across different
 * page loads share identical category/question IDs, enabling comparison.
 */
function makeSuffix(templateIdx: number, itemIdx: number): string {
  const b32 = "0123456789abcdefghjkmnpqrstvwxyz";
  // First char identifies template (0-7)
  let suffix = b32[templateIdx % 8];
  // Encode item index in last 6 chars (base32), pad middle with zeros
  let idx = itemIdx;
  const indexChars: string[] = [];
  for (let i = 0; i < 6; i++) {
    indexChars.unshift(b32[idx % 32]);
    idx = Math.floor(idx / 32);
  }
  suffix += "0".repeat(19) + indexChars.join(""); // 1 + 19 + 6 = 26
  return suffix;
}

/**
 * Factory that produces Question and Category builders with stable,
 * deterministic IDs tied to a template index.
 */
function stableIds(templateIdx: number) {
  let counter = 0;
  return {
    q(value: string): Question {
      return Question.withStableId(makeSuffix(templateIdx, counter++), value);
    },
    c(name: string, questions: Question[]): Category {
      return Category.withStableId(
        makeSuffix(templateIdx, counter++),
        name,
        questions,
      );
    },
  };
}

// Template 0: Relationship Menu (Monogamous/Light)
const ids0 = stableIds(0);
const RelationshipMenuMonoSimple = Form.new(
  "Relationship Menu (Monogamous/Light)",
  [
    ids0.c("Commitment", [
      ids0.q("Marriage"),
      ids0.q("Pregnancy/children together"),
      ids0.q("Cohabitation"),
      ids0.q("Home ownership"),
      ids0.q("Commitment to working through challenges"),
      ids0.q("Commitment to relationship maintenance"),
    ]),
    ids0.c("Emotional Intimacy", [
      ids0.q("Expressing happiness and joy"),
      ids0.q("Offering support in hard times"),
      ids0.q("Venting/Ranting"),
      ids0.q('Saying "I love you"'),
      ids0.q("Sharing stories about past"),
      ids0.q("Sharing hopes for future"),
    ]),
    ids0.c("Social Integration", [
      ids0.q("Meeting children"),
      ids0.q("Meeting parents/siblings/extended family"),
      ids0.q("Meeting friends"),
      ids0.q("Presenting as a couple in public settings"),
      ids0.q("Presenting as a couple on social media"),
    ]),
    ids0.c("Communication", [
      ids0.q("Daily or frequent check-ins"),
      ids0.q("Texting"),
      ids0.q("Phone/video calls"),
      ids0.q("Discussing work and hobbies"),
      ids0.q("Ability to express disagreements or hurt feelings"),
    ]),
    ids0.c("Physical Intimacy", [
      ids0.q("Physical affection"),
      ids0.q("Kissing"),
      ids0.q("Sexual intimacy"),
      ids0.q("Orgasms"),
      ids0.q("Condom/Barrier use"),
    ]),
    ids0.c("Caregiving", [
      ids0.q("General needs/favours"),
      ids0.q("Disability"),
      ids0.q("Emergencies"),
      ids0.q("Health/Illness"),
    ]),
    ids0.c("Quality Time", [
      ids0.q("Regularly scheduled time together"),
      ids0.q("Date nights"),
      ids0.q("Spending the night"),
      ids0.q("Shared hobbies or activities"),
      ids0.q("Vacations together as a couple"),
    ]),
    ids0.c("Autonomy", [
      ids0.q("Balance time together and apart"),
      ids0.q("Support to pursue independent interests"),
      ids0.q("Maintaining independent friendships"),
      ids0.q("Alone time"),
    ]),
  ],
);

// Template 1: Relationship Menu (Polygamous/Light)
const ids1 = stableIds(1);
const RelationshipMenuPolySimple = Form.new(
  "Relationship Menu (Polygamous/Light)",
  [
    ids1.c("Commitment", [
      ids1.q("Marriage"),
      ids1.q("Pregnancy/children together"),
      ids1.q("Sharing pet(s)"),
      ids1.q("Cohabitation"),
      ids1.q("Prioritization over other partners"),
      ids1.q("Relationship labels"),
      ids1.q("Commitment to working through challenges"),
      ids1.q("Commitment to relationship maintenance"),
    ]),
    ids1.c("Emotional Intimacy", [
      ids1.q("Expressing happiness and joy"),
      ids1.q("Offering support in hard times"),
      ids1.q("Venting/Ranting"),
      ids1.q('Saying "I love you"'),
      ids1.q("Sharing stories about past"),
      ids1.q("Sharing hopes for future"),
    ]),
    ids1.c("Social Integration", [
      ids1.q("Meeting metamours (partners other partners)"),
      ids1.q("Meeting children"),
      ids1.q("Meeting parents/siblings/extended/found family"),
      ids1.q("Meeting friends"),
      ids1.q("Presenting as a couple in public settings"),
      ids1.q("Presenting as a couple on social media"),
    ]),
    ids1.c("Communication", [
      ids1.q("Daily or frequent check-ins"),
      ids1.q("Texting"),
      ids1.q("Phone/video calls"),
      ids1.q("Discussing work and hobbies"),
      ids1.q("Discussing partners/relationships"),
      ids1.q("Ability to express disagreements or hurt feelings"),
    ]),
    ids1.c("Physical Intimacy", [
      ids1.q("Physical affection (e.g. touch, hugs, cuddles)"),
      ids1.q("Kissing"),
      ids1.q("Public display of affection"),
      ids1.q("Sexual Intimacy"),
      ids1.q("Condom/Barrier use"),
      ids1.q("Regular STI testing"),
    ]),
    ids1.c("Caregiving", [
      ids1.q("General needs/favours"),
      ids1.q("Disability"),
      ids1.q("Emergencies"),
      ids1.q("Health/Illness"),
    ]),
    ids1.c("Quality Time", [
      ids1.q("Regularly scheduled time together"),
      ids1.q("Date nights"),
      ids1.q("Spending the night"),
      ids1.q("Shared hobbies or activities"),
      ids1.q("Shared vacations"),
    ]),
    ids1.c("Autonomy", [
      ids1.q("Balance time together and apart"),
      ids1.q("Support to pursue independent interests"),
      ids1.q("Sexual exclusivity"),
      ids1.q("Romantic/Emotional exclusivity"),
      ids1.q("Maintaining independent friendships"),
      ids1.q("Maintaining independent romantic relationships"),
      ids1.q("Alone time"),
    ]),
  ],
);

// Template 2: Relationship Menu (Monogamous/Advanced)
const ids2 = stableIds(2);
const RelationshipMenuMonoAdvanced = Form.new(
  "Relationship Menu (Monogamous/Advanced)",
  [
    ids2.c("Commitment", [
      ids2.q("Marriage"),
      ids2.q("Pregnancy/Having children together"),
      ids2.q("Parenting children from other partnerships"),
      ids2.q("Sharing pet(s)"),
      ids2.q("Having a key"),
      ids2.q("Cohabitation"),
      ids2.q("Home ownership"),
      ids2.q("Planning for future"),
      ids2.q("Expectation of long term involvement"),
      ids2.q("Commitment to working through challenges"),
      ids2.q("Commitment to relationship maintenance"),
      ids2.q("Power of attorney/wills"),
      ids2.q("Support through health challenges"),
    ]),
    ids2.c("Emotional Intimacy", [
      ids2.q("Expressing happiness and joy"),
      ids2.q("Active listening"),
      ids2.q("Offering support in hard times"),
      ids2.q("Sharing vulnerable feelings"),
      ids2.q("Venting/Ranting"),
      ids2.q('Saying "I love you"'),
      ids2.q("Sharing stories about past"),
      ids2.q("Sharing hopes for future"),
      ids2.q("Being asked for advice"),
      ids2.q("Knowing personal likes/dislikes (e.g. fav foods)"),
      ids2.q("Using pet names"),
      ids2.q("Sharing about mental health challenges"),
      ids2.q("Supporting mental health work"),
    ]),
    ids2.c("Social Integration", [
      ids2.q("Meeting children"),
      ids2.q("Meeting parents/siblings/extended/found family"),
      ids2.q("Meeting friends"),
      ids2.q("Spending time as a couple with friends/family"),
      ids2.q("Serving as +1 for social events"),
      ids2.q("Presenting as a couple in public settings"),
      ids2.q("Following on social media"),
      ids2.q("Presenting as a couple on social media"),
      ids2.q("Presenting as a couple in professional settings"),
      ids2.q("Joint vacations with (found-)family"),
    ]),
    ids2.c("Communication", [
      ids2.q("Daily or frequent check-ins"),
      ids2.q("Texting"),
      ids2.q("Phone/video calls"),
      ids2.q("Discussing work and hobbies"),
      ids2.q("Discussing family"),
      ids2.q("Discussing politics and current events"),
      ids2.q("Ability to express disagreements or hurt feelings"),
      ids2.q("Ability to address and resolve conflict"),
      ids2.q("Radical honesty"),
    ]),
    ids2.c("Physical Intimacy", [
      ids2.q("Physical affection (e.g. touch, hugs, cuddles)"),
      ids2.q("Kissing"),
      ids2.q("Public display of affection"),
      ids2.q("Co-Sleeping"),
      ids2.q("Nudity"),
      ids2.q("Compatible sex drives"),
      ids2.q("Sexual chemistry"),
      ids2.q("Orgasms"),
      ids2.q("Oral sex"),
      ids2.q("Manual sex (e.g. fingering)"),
      ids2.q("Mutual masturbation"),
      ids2.q("Penetration/PIV"),
      ids2.q("Sex toys"),
      ids2.q("Condom/Barrier use"),
      ids2.q("Regular STI testing"),
      ids2.q("Kinky stuff (e.g. BDSM)"),
      ids2.q("Threesomes or group sex"),
      ids2.q("Attending events (e.g. Private play parties)"),
    ]),
    ids2.c("Bathroom Intimacy", [
      ids2.q("Showering together"),
      ids2.q("Be present when urinating"),
      ids2.q("Be present when pooping"),
      ids2.q("Unlocked door"),
    ]),
    ids2.c("Financial Management", [
      ids2.q("Shared bank account(s)"),
      ids2.q("Mutual contributions to activities"),
      ids2.q("Co-ownership of property"),
      ids2.q("Financial support"),
      ids2.q("Large gifts"),
      ids2.q("Complete financial integration"),
    ]),
    ids2.c("Technology", [
      ids2.q("Shared passwords"),
      ids2.q("Shared accounts"),
      ids2.q("Shared devices (e.g. computers, phones)"),
    ]),
    ids2.c("Domestic", [
      ids2.q("Shared bed/Sleeping space"),
      ids2.q("Cooking together"),
      ids2.q("Sharing meals"),
      ids2.q("Sharing chores and routines"),
    ]),
    ids2.c("Caregiving", [
      ids2.q("General needs/favours"),
      ids2.q("Disability"),
      ids2.q("Emergencies"),
      ids2.q("Health/Illness"),
      ids2.q("End of life"),
    ]),
    ids2.c("Co-Caregiving", [
      ids2.q("(Found-)Family Members"),
      ids2.q("Animals/Pet(s)"),
      ids2.q("Plants"),
      ids2.q("Children"),
    ]),
    ids2.c("Quality Time", [
      ids2.q("Regularly scheduled time together"),
      ids2.q("Date nights"),
      ids2.q("Spending the night"),
      ids2.q("Shared hobbies or activities"),
      ids2.q("Shared vacations"),
      ids2.q("Calendar management/integration"),
    ]),
    ids2.c("Autonomy", [
      ids2.q("Balance time together and apart"),
      ids2.q("Support to pursue independent interests"),
      ids2.q("Maintaining independent friendships"),
      ids2.q("Equal distribution of relationship power"),
      ids2.q("Alone time"),
    ]),
  ],
);

// Template 3: Relationship Menu (Polygamous/Advanced)
const ids3 = stableIds(3);
const RelationshipMenuPolyAdvanced = Form.new(
  "Relationship Menu (Polygamous/Advanced)",
  [
    ids3.c("Commitment", [
      ids3.q("Marriage"),
      ids3.q("Pregnancy/Having children together"),
      ids3.q("Coparenting children from other partnerships"),
      ids3.q("Sharing pet(s)"),
      ids3.q("Having a key"),
      ids3.q("Cohabitation"),
      ids3.q("Home ownership"),
      ids3.q("Prioritization over other partners"),
      ids3.q("Relationship labels"),
      ids3.q("Planning for future"),
      ids3.q("Expectation of long term involvement"),
      ids3.q("Commitment to working through challenges"),
      ids3.q("Commitment to relationship maintenance"),
      ids3.q("Power of attorney/wills"),
      ids3.q("Support through health challenges"),
      ids3.q("Restrictions due to other relationships"),
      ids3.q("Restrictions for other relationships"),
    ]),
    ids3.c("Emotional Intimacy", [
      ids3.q("Expressing happiness and joy"),
      ids3.q("Active listening"),
      ids3.q("Offering support in hard times"),
      ids3.q("Sharing vulnerable feelings"),
      ids3.q("Venting/Ranting"),
      ids3.q('Saying "I love you"'),
      ids3.q("Sharing stories about past"),
      ids3.q("Sharing hopes for future"),
      ids3.q("Being asked for advice"),
      ids3.q("Knowing personal likes/dislikes (e.g. fav foods)"),
      ids3.q("Using pet names"),
      ids3.q("Sharing about mental health challenges"),
      ids3.q("Supporting mental health work"),
    ]),
    ids3.c("Social Integration", [
      ids3.q("Meeting metamours (partners other partners)"),
      ids3.q("Meeting children"),
      ids3.q("Meeting parents/siblings/extended/found family"),
      ids3.q("Meeting friends"),
      ids3.q("Spending time as a couple with friends/family"),
      ids3.q("Positive relationships with metamors"),
      ids3.q("Serving as +1 for social events"),
      ids3.q("Presenting as a couple in public settings"),
      ids3.q("Following on social media"),
      ids3.q("Presenting as a couple on social media"),
      ids3.q("Presenting as a couple in professional settings"),
      ids3.q("Joint vacations with family/metamors"),
    ]),
    ids3.c("Communication", [
      ids3.q("Daily or frequent check-ins"),
      ids3.q("Texting"),
      ids3.q("Phone/video calls"),
      ids3.q("Discussing work and hobbies"),
      ids3.q("Discussing family"),
      ids3.q("Discussing partners/relationships"),
      ids3.q("Discussing politics and current events"),
      ids3.q("Ability to express disagreements or hurt feelings"),
      ids3.q("Ability to address and resolve conflict"),
      ids3.q("Radical honesty"),
    ]),
    ids3.c("Physical Intimacy", [
      ids3.q("Physical affection (e.g. touch, hugs, cuddles)"),
      ids3.q("Kissing"),
      ids3.q("Public display of affection"),
      ids3.q("Co-Sleeping"),
      ids3.q("Nudity"),
      ids3.q("Compatible sex drives"),
      ids3.q("Sexual chemistry"),
      ids3.q("Orgasms"),
      ids3.q("Oral sex"),
      ids3.q("Manual sex (e.g. fingering)"),
      ids3.q("Mutual masturbation"),
      ids3.q("Penetration/PIV"),
      ids3.q("Sex toys"),
      ids3.q("Condom/Barrier use"),
      ids3.q("Regular STI testing"),
      ids3.q("Kinky stuff (e.g. BDSM)"),
      ids3.q("Threesomes or group sex"),
      ids3.q("Attending events (e.g. Private play parties)"),
    ]),
    ids3.c("Bathroom Intimacy", [
      ids3.q("Showering together"),
      ids3.q("Be present when urinating"),
      ids3.q("Be present when pooping"),
      ids3.q("Unlocked door"),
    ]),
    ids3.c("Financial Management", [
      ids3.q("Shared bank account(s)"),
      ids3.q("Mutual contributions to activities"),
      ids3.q("Co-ownership of property"),
      ids3.q("Financial support"),
      ids3.q("Large gifts"),
      ids3.q("Complete financial integration"),
    ]),
    ids3.c("Technology", [
      ids3.q("Shared passwords"),
      ids3.q("Shared accounts"),
      ids3.q("Shared devices (e.g. computers, phones)"),
    ]),
    ids3.c("Domestic", [
      ids3.q("Shared Bed/Sleeping space"),
      ids3.q("Cooking together"),
      ids3.q("Sharing meals"),
      ids3.q("Sharing chores and routines"),
    ]),
    ids3.c("Caregiving", [
      ids3.q("General needs/favours"),
      ids3.q("Disability"),
      ids3.q("Emergencies"),
      ids3.q("Health/Illness"),
      ids3.q("End of life"),
    ]),
    ids3.c("(Co-Caregiving", [
      ids3.q("Partners/Metamours"),
      ids3.q("(Found-)Family Members"),
      ids3.q("Animals/Pet(s)"),
      ids3.q("Plants"),
      ids3.q("Children"),
    ]),
    ids3.c("Quality Time", [
      ids3.q("Regularly scheduled time together"),
      ids3.q("Date nights"),
      ids3.q("Spending the night"),
      ids3.q("Shared hobbies or activities"),
      ids3.q("Shared vacations"),
      ids3.q("Calendar management/integration"),
    ]),
    ids3.c("Autonomy", [
      ids3.q("Balance time together and apart"),
      ids3.q("Support to pursue independent interests"),
      ids3.q("Sexual exclusivity"),
      ids3.q("Romantic/Emotional exclusivity"),
      ids3.q("Maintaining independent friendships"),
      ids3.q("Maintaining independent romantic relationships"),
      ids3.q("Equal distribution of relationship power"),
      ids3.q("Alone time"),
    ]),
  ],
);

// Template 4: Pen and Paper Preferences
const ids4 = stableIds(4);
const PenAndPaperTemplate = Form.new("Pen and Paper Preferences", [
  ids4.c("Frequency", [
    ids4.q("Dayily Games"),
    ids4.q("Weekly Games"),
    ids4.q("Bi-weekly Games"),
    ids4.q("Monthly Games"),
    ids4.q("Regular Sessions"),
    ids4.q("Irregular Sessions"),
  ]),
  ids4.c("Session Length", [
    ids4.q("Short (1-2 hours)"),
    ids4.q("Medium (3-4 hours)"),
    ids4.q("Long (5+ hours)"),
  ]),
  ids4.c("Play Style", [
    ids4.q("Theater of the Mind"),
    ids4.q("Haptic/Physical Props"),
    ids4.q("Narrative"),
    ids4.q("Performative"),
    ids4.q("Simulationist"),
    ids4.q("Competitive / Min-Maxing"),
    ids4.q("Cooperative / Group Storytelling"),
  ]),
  ids4.c("Game Type", [
    ids4.q("Combat"),
    ids4.q("Roleplay"),
    ids4.q("Exploration"),
    ids4.q("Social"),
    ids4.q("Puzzle"),
    ids4.q("Mystery"),
    ids4.q("Horror"),
    ids4.q("Sandbox"),
    ids4.q("Linear"),
    ids4.q("Open World"),
  ]),
  ids4.c("Game Tone", [
    ids4.q("Serious"),
    ids4.q("Silly"),
    ids4.q("Dark"),
    ids4.q("Light"),
    ids4.q("Mature"),
    ids4.q("Family Friendly"),
    ids4.q("Adults Only"),
  ]),
  ids4.c("Game Setting", [
    ids4.q("High Fantasy"),
    ids4.q("Low Fantasy"),
    ids4.q("Modern"),
    ids4.q("Historical"),
    ids4.q("Sci-Fi"),
    ids4.q("Post-Apocalyptic"),
    ids4.q("Other"),
  ]),
]);

const Empty = Form.new("New Template", []);

const FormTemplates = [
  { id: "empty", name: "Empty", template: Empty },
  { id: "pnp", name: "PnP Preferences", template: PenAndPaperTemplate },
  {
    id: "rel_monosimp",
    name: "Reduced Monogamous Relationship Menu",
    template: RelationshipMenuMonoSimple,
  },
  {
    id: "rel_polysimp",
    name: "Reduced Polygamous Relationship Menu",
    template: RelationshipMenuPolySimple,
  },
  {
    id: "rel_monoadv",
    name: "Advanced Monogamous Relationship Menu",
    template: RelationshipMenuMonoAdvanced,
  },
  {
    id: "rel_polyadv",
    name: "Advanced Polygamous Relationship Menu",
    template: RelationshipMenuPolyAdvanced,
  },
];

export default FormTemplates;
