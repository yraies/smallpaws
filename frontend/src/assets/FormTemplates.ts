// @ts-ignore
import { Category, Form, Question } from "../types/Form";
import RelationshipAdv from "../assets/RelationshipAdv.json";

const RelationshipMenuMonoSimple = Form.new('Relationship Menu (Monogamous/Light)', [
    Category.new('Commitment', [
        Question.new('Marriage'),
        Question.new('Pregnancy/children together'),
        Question.new('Cohabitation'),
        Question.new('Home ownership'),
        Question.new('Commitment to working through challenges'),
        Question.new('Commitment to relationship maintenance')
    ]),
    Category.new('Emotional Intimacy', [
        Question.new('Expressing happiness and joy'),
        Question.new('Offering support in hard times'),
        Question.new('Venting/Ranting'),
        Question.new('Saying "I love you"'),
        Question.new('Sharing stories about past'),
        Question.new('Sharing hopes for future')
    ]),
    Category.new('Social Integration', [
        Question.new('Meeting children'),
        Question.new('Meeting parents/siblings/extended family'),
        Question.new('Meeting friends'),
        Question.new('Presenting as a couple in public settings'),
        Question.new('Presenting as a couple on social media')
    ]),
    Category.new('Communication', [
        Question.new('Daily or frequent check-ins'),
        Question.new('Texting'),
        Question.new('Phone/video calls'),
        Question.new('Discussing work and hobbies'),
        Question.new('Ability to express disagreements or hurt feelings')
    ]),
    Category.new('Physical Intimacy', [
        Question.new('Physical affection'),
        Question.new('Kissing'),
        Question.new('Sexual intimacy'),
        Question.new('Orgasms'),
        Question.new('Condom/Barrier use')
    ]),
    Category.new('Caregiving', [
        Question.new('General needs/favours'),
        Question.new('Disability'),
        Question.new('Emergencies'),
        Question.new('Health/Illness')
    ]),
    Category.new('Quality Time', [
        Question.new('Regularly scheduled time together'),
        Question.new('Date nights'),
        Question.new('Spending the night'),
        Question.new('Shared hobbies or activities'),
        Question.new('Vacations together as a couple')
    ]),
    Category.new('Autonomy', [
        Question.new('Balance time together and apart'),
        Question.new('Support to pursue independent interests'),
        Question.new('Maintaining independent friendships'),
        Question.new('Maintaining independent romantic relationships'),
        Question.new('Alone time')
    ]),
]);

const RelationshipMenuPolySimple = Form.new('Relationship Menu (Polygamous/Light)', [
    Category.new('Commitment', [
        Question.new('Marriage'),
        Question.new('Pregnancy/children together'),
        Question.new('Sharing pet(s)'),
        Question.new('Cohabitation'),
        Question.new('Prioritization over other partners'),
        Question.new('Relationship labels'),
        Question.new('Commitment to working through challenges'),
        Question.new('Commitment to relationship maintenance')
    ]),
    Category.new('Emotional Intimacy', [
        Question.new('Expressing happiness and joy'),
        Question.new('Offering support in hard times'),
        Question.new('Venting/Ranting'),
        Question.new('Saying "I love you"'),
        Question.new('Sharing stories about past'),
        Question.new('Sharing hopes for future')
    ]),
    Category.new('Social Integration', [
        Question.new('Meeting metamours (partners’ other partners)'),
        Question.new('Meeting children'),
        Question.new('Meeting parents/siblings/extended/found family'),
        Question.new('Meeting friends'),
        Question.new('Presenting as a couple in public settings'),
        Question.new('Presenting as a couple on social media')
    ]),
    Category.new('Communication', [
        Question.new('Daily or frequent check-ins'),
        Question.new('Texting'),
        Question.new('Phone/video calls'),
        Question.new('Discussing work and hobbies'),
        Question.new('Discussing partners/relationships'),
        Question.new('Ability to express disagreements or hurt feelings')
    ]),
    Category.new('Physical Intimacy', [
        Question.new('Physical affection (e.g. touch, hugs, cuddles)'),
        Question.new('Kissing'),
        Question.new('Public display of affection'),
        Question.new('Sexual Intimacy'),
        Question.new('Condom/Barrier use'),
        Question.new('Regular STI testing')
    ]),
    Category.new('Caregiving', [
        Question.new('General needs/favours'),
        Question.new('Disability'),
        Question.new('Emergencies'),
        Question.new('Health/Illness')
    ]),
    Category.new('Quality Time', [
        Question.new('Regularly scheduled time together'),
        Question.new('Date nights'),
        Question.new('Spending the night'),
        Question.new('Shared hobbies or activities'),
        Question.new('Shared vacations')
    ]),
    Category.new('Autonomy', [
        Question.new('Balance time together and apart'),
        Question.new('Support to pursue independent interests'),
        Question.new('Sexual exclusivity'),
        Question.new('Romantic/Emotional exclusivity'),
        Question.new('Maintaining independent friendships'),
        Question.new('Maintaining independent romantic relationships'),
        Question.new('Alone time')
    ]),
]);

const RelationshipMenuMonoAdvanced = Form.new('Relationship Menu (Monogamous/Advanced)', [
    Category.new('Commitment', [
        Question.new('Marriage'),
        Question.new('Pregnancy/Having children together'),
        Question.new('Parenting children from other partnerships'),
        Question.new('Sharing pet(s)'),
        Question.new('Having a key'),
        Question.new('Cohabitation'),
        Question.new('Home ownership'),
        Question.new('Planning for future'),
        Question.new('Expectation of long term involvement'),
        Question.new('Commitment to working through challenges'),
        Question.new('Commitment to relationship maintenance'),
        Question.new('Power of attorney/wills'),
        Question.new('Support through health challenges')
    ]),
    Category.new('Emotional Intimacy', [
        Question.new('Expressing happiness and joy'),
        Question.new('Active listening'),
        Question.new('Offering support in hard times'),
        Question.new('Sharing vulnerable feelings'),
        Question.new('Venting/Ranting'),
        Question.new('Saying "I love you"'),
        Question.new('Sharing stories about past'),
        Question.new('Sharing hopes for future'),
        Question.new('Being asked for advice'),
        Question.new('Knowing personal likes/dislikes (e.g. fav foods)'),
        Question.new('Using pet names'),
        Question.new('Sharing about mental health challenges'),
        Question.new('Supporting mental health work')
    ]),
    Category.new('Social Integration', [
        Question.new('Meeting children'),
        Question.new('Meeting parents/siblings/extended/found family'),
        Question.new('Meeting friends'),
        Question.new('Spending time as a couple with friends/family'),
        Question.new('Serving as +1 for social events'),
        Question.new('Presenting as a couple in public settings'),
        Question.new('Following on social media'),
        Question.new('Presenting as a couple on social media'),
        Question.new('Presenting as a couple in professional settings'),
        Question.new('Joint vacations with (found-)family')
    ]),
    Category.new('Communication', [
        Question.new('Daily or frequent check-ins'),
        Question.new('Texting'),
        Question.new('Phone/video calls'),
        Question.new('Discussing work and hobbies'),
        Question.new('Discussing family'),
        Question.new('Discussing politics and current events'),
        Question.new('Ability to express disagreements or hurt feelings'),
        Question.new('Ability to address and resolve conflict'),
        Question.new('Radical honesty')
    ]),
    Category.new('Physical Intimacy', [
        Question.new('Physical affection (e.g. touch, hugs, cuddles)'),
        Question.new('Kissing'),
        Question.new('Public display of affection'),
        Question.new('Co-Sleeping'),
        Question.new('Nudity'),
        Question.new('Compatible sex drives'),
        Question.new('Sexual chemistry'),
        Question.new('Orgasms'),
        Question.new('Oral sex'),
        Question.new('Manual sex (e.g. fingering)'),
        Question.new('Mutual masturbation'),
        Question.new('Penetration/PIV'),
        Question.new('Sex toys'),
        Question.new('Condom/Barrier use'),
        Question.new('Regular STI testing'),
        Question.new('Kinky stuff (e.g. BDSM)'),
        Question.new('Threesomes or group sex'),
        Question.new('Attending events (e.g. Private play parties)')
    ]),
    Category.new('Bathroom Intimacy', [
        Question.new('Showering together'),
        Question.new('Be present when urinating'),
        Question.new('Be present when pooping'),
        Question.new('Unlocked door')
    ]),
    Category.new('Financial Management', [
        Question.new('Shared bank account(s)'),
        Question.new('Mutual contributions to activities'),
        Question.new('Co-ownership of property'),
        Question.new('Financial support'),
        Question.new('Large gifts'),
        Question.new('Complete financial integration')
    ]),
    Category.new('Technology', [
        Question.new('Shared passwords'),
        Question.new('Shared accounts'),
        Question.new('Shared devices (e.g. computers, phones)')
    ]),
    Category.new('Domestic', [
        Question.new('Shared bed/Sleeping space'),
        Question.new('Cooking together'),
        Question.new('Sharing meals'),
        Question.new('Sharing chores and routines')
    ]),
    Category.new('Caregiving', [
        Question.new('General needs/favours'),
        Question.new('Disability'),
        Question.new('Emergencies'),
        Question.new('Health/Illness'),
        Question.new('End of life')
    ]),
    Category.new('(Co-Caregiving', [
        Question.new('(Found-)Family Members'),
        Question.new('Animals/Pet(s)'),
        Question.new('Plants'),
        Question.new('Children')
    ]),
    Category.new('Quality Time', [
        Question.new('Regularly scheduled time together'),
        Question.new('Date nights'),
        Question.new('Spending the night'),
        Question.new('Shared hobbies or activities'),
        Question.new('Shared vacations'),
        Question.new('Calendar management/integration')
    ]),
    Category.new('Autonomy', [
        Question.new('Balance time together and apart'),
        Question.new('Support to pursue independent interests'),
        Question.new('Maintaining independent friendships'),
        Question.new('Equal distribution of relationship power'),
        Question.new('Alone time')
    ]),
]);

const RelationshipMenuPolyAdvanced = Form.new('Relationship Menu (Polygamous/Advanced)', [
    Category.new('Commitment', [
        Question.new('Marriage'),
        Question.new('Pregnancy/Having children together'),
        Question.new('Coparenting children from other partnerships'),
        Question.new('Sharing pet(s)'),
        Question.new('Having a key'),
        Question.new('Cohabitation'),
        Question.new('Home ownership'),
        Question.new('Prioritization over other partners'),
        Question.new('Relationship labels'),
        Question.new('Planning for future'),
        Question.new('Expectation of long term involvement'),
        Question.new('Commitment to working through challenges'),
        Question.new('Commitment to relationship maintenance'),
        Question.new('Power of attorney/wills'),
        Question.new('Support through health challenges'),
        Question.new('Restrictions due to other relationships'),
        Question.new('Restrictions for other relationships')
    ]),
    Category.new('Emotional Intimacy', [
        Question.new('Expressing happiness and joy'),
        Question.new('Active listening'),
        Question.new('Offering support in hard times'),
        Question.new('Sharing vulnerable feelings'),
        Question.new('Venting/Ranting'),
        Question.new('Saying "I love you"'),
        Question.new('Sharing stories about past'),
        Question.new('Sharing hopes for future'),
        Question.new('Being asked for advice'),
        Question.new('Knowing personal likes/dislikes (e.g. fav foods)'),
        Question.new('Using pet names'),
        Question.new('Sharing about mental health challenges'),
        Question.new('Supporting mental health work'),
    ]),
    Category.new('Social Integration', [
        Question.new('Meeting metamours (partners’ other partners)'),
        Question.new('Meeting children'),
        Question.new('Meeting parents/siblings/extended/found family'),
        Question.new('Meeting friends'),
        Question.new('Spending time as a couple with friends/family'),
        Question.new('Positive relationships with metamors'),
        Question.new('Serving as +1 for social events'),
        Question.new('Presenting as a couple in public settings'),
        Question.new('Following on social media'),
        Question.new('Presenting as a couple on social media'),
        Question.new('Presenting as a couple in professional settings'),
        Question.new('Joint vacations with family/metamors')
    ]),
    Category.new('Communication', [
        Question.new('Daily or frequent check-ins'),
        Question.new('Texting'),
        Question.new('Phone/video calls'),
        Question.new('Discussing work and hobbies'),
        Question.new('Discussing family'),
        Question.new('Discussing partners/relationships'),
        Question.new('Discussing politics and current events'),
        Question.new('Ability to express disagreements or hurt feelings'),
        Question.new('Ability to address and resolve conflict'),
        Question.new('Radical honesty')
    ]),
    Category.new('Physical Intimacy', [
        Question.new('Physical affection (e.g. touch, hugs, cuddles)'),
        Question.new('Kissing'),
        Question.new('Public display of affection'),
        Question.new('Co-Sleeping'),
        Question.new('Nudity'),
        Question.new('Compatible sex drives'),
        Question.new('Sexual chemistry'),
        Question.new('Orgasms'),
        Question.new('Oral sex'),
        Question.new('Manual sex (e.g. fingering)'),
        Question.new('Mutual masturbation'),
        Question.new('Penetration/PIV'),
        Question.new('Sex toys'),
        Question.new('Condom/Barrier use'),
        Question.new('Regular STI testing'),
        Question.new('Kinky stuff (e.g. BDSM)'),
        Question.new('Threesomes or group sex'),
        Question.new('Attending events (e.g. Private play parties)')
    ]),
    Category.new('Bathroom Intimacy', [
        Question.new('Showering together'),
        Question.new('Be present when urinating'),
        Question.new('Be present when pooping'),
        Question.new('Unlocked door')
    ]),
    Category.new('Financial Management', [
        Question.new('Shared bank account(s)'),
        Question.new('Mutual contributions to activities'),
        Question.new('Co-ownership of property'),
        Question.new('Financial support'),
        Question.new('Large gifts'),
        Question.new('Complete financial integration')
    ]),
    Category.new('Technology', [
        Question.new('Shared passwords'),
        Question.new('Shared accounts'),
        Question.new('Shared devices (e.g. computers, phones)')
    ]),
    Category.new('Domestic', [
        Question.new('Shared Bed/Sleeping space'),
        Question.new('Cooking together'),
        Question.new('Sharing meals'),
        Question.new('Sharing chores and routines')
    ]),
    Category.new('Caregiving', [
        Question.new('General needs/favours'),
        Question.new('Disability'),
        Question.new('Emergencies'),
        Question.new('Health/Illness'),
        Question.new('End of life')
    ]),
    Category.new('(Co-Caregiving', [
        Question.new('Partners/Metamours'),
        Question.new('(Found-)Family Members'),
        Question.new('Animals/Pet(s)'),
        Question.new('Plants'),
        Question.new('Children')
    ]),
    Category.new('Quality Time', [
        Question.new('Regularly scheduled time together'),
        Question.new('Date nights'),
        Question.new('Spending the night'),
        Question.new('Shared hobbies or activities'),
        Question.new('Shared vacations'),
        Question.new('Calendar management/integration')
    ]),
    Category.new('Autonomy', [
        Question.new('Balance time together and apart'),
        Question.new('Support to pursue independent interests'),
        Question.new('Sexual exclusivity'),
        Question.new('Romantic/Emotional exclusivity'),
        Question.new('Maintaining independent friendships'),
        Question.new('Maintaining independent romantic relationships'),
        Question.new('Equal distribution of relationship power'),
        Question.new('Alone time')
    ]),
]);

const PenAndPaperTemplate = Form.new('Pen and Paper Preferences', [
    Category.new('Frequency', [
        Question.new('Dayily Games'),
        Question.new('Weekly Games'),
        Question.new('Bi-weekly Games'),
        Question.new('Monthly Games'),
        Question.new('Regular Sessions'),
        Question.new('Irregular Sessions'),
    ]),
    Category.new('Session Length', [
        Question.new('Short (1-2 hours)'),
        Question.new('Medium (3-4 hours)'),
        Question.new('Long (5+ hours)'),
    ]),
    Category.new('Play Style', [
        Question.new('Theater of the Mind'),
        Question.new('Haptic/Physical Props'),
        Question.new('Narrative'),
        Question.new('Performative'),
        Question.new('Simulationist'),
        Question.new('Competitive / Min-Maxing'),
        Question.new('Cooperative / Group Storytelling'),
    ]),
    Category.new('Game Type', [
        Question.new('Combat'),
        Question.new('Roleplay'),
        Question.new('Exploration'),
        Question.new('Social'),
        Question.new('Puzzle'),
        Question.new('Mystery'),
        Question.new('Horror'),
        Question.new('Sandbox'),
        Question.new('Linear'),
        Question.new('Open World'),
    ]),
    Category.new('Game Tone', [
        Question.new('Serious'),
        Question.new('Silly'),
        Question.new('Dark'),
        Question.new('Light'),
        Question.new('Mature'),
        Question.new('Family Friendly'),
        Question.new('Adults Only'),
    ]),
    Category.new('Game Setting', [
        Question.new('High Fantasy'),
        Question.new('Low Fantasy'),
        Question.new('Modern'),
        Question.new('Historical'),
        Question.new('Sci-Fi'),
        Question.new('Post-Apocalyptic'),
        Question.new('Other'),
    ])
]);



const Empty = Form.new('New Form', [])
//@ts-ignore
const RelationshipMenu = Form.fromPOJO(RelationshipAdv);

export default [
    { id: 'empty', name: 'Empty', template: Empty },
    { id: 'pnp', name: 'PnP Preferences', template: PenAndPaperTemplate },
    { id: 'rel_monosimp', name: 'Simp. Mono. Relationship', template: RelationshipMenuMonoSimple },
    { id: 'rel_polysimp', name: 'Simp. Poly. Relationship', template: RelationshipMenuPolySimple},
    { id: 'rel_monoadv', name: 'Adv. Mono. Relationship', template: RelationshipMenuMonoAdvanced},
    { id: 'rel_polyadv', name: 'Adv. Poly. Relationship', template: RelationshipMenuPolyAdvanced }
];