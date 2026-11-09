// Kursinhalt A1 – Hochdeutsch mit Schweizer Schreibweise (ss statt ß).
// Jede Einheit hat 12 Wörter, 6–7 Sätze und einen Grammatik-Tipp (Englisch/Französisch).
//
// Wort:  w(Deutsch, Englisch, Französisch, Bild, Bildaufgabe?, [weitere richtige Antworten])
//        Bildaufgabe = true heisst: Das Bild ist eindeutig genug für „Was siehst du? Schreibe es auf Deutsch.“
// Satz:  s(Deutsch, Englisch, Französisch)
//
// Diese Datei wird von der Cloud Function ausgeliefert (nur an Zahlende).
// Im Demo-Modus lädt die Web-App sie direkt.

import { TR } from './tr.js';

const w = (de, en, fr, e, p = true, alt) => ({ de, en, fr, e, p, ...(alt ? { alt } : {}) });
const s = (de, en, fr) => ({ de, en, fr });

export const COURSE = {
  title: 'Hallo Deutsch!',
  level: 'A1',
  units: [
    {
      id: 'u01',
      emoji: '👋',
      color: '#6366F1',
      title: { de: 'Hallo!', en: 'Hello!', fr: 'Bonjour !' },
      words: [
        w('Hallo', 'Hello', 'Salut', '👋', false, ['Guten Tag']),
        w('Guten Morgen', 'Good morning', 'Bonjour (le matin)', '🌅', false),
        w('Guten Tag', 'Good day', 'Bonjour', '☀️', false, ['Hallo']),
        w('Guten Abend', 'Good evening', 'Bonsoir', '🌆', false),
        w('Gute Nacht', 'Good night', 'Bonne nuit', '🌙', false),
        w('Tschüss', 'Bye', 'Tchao', '🚶', false, ['Auf Wiedersehen']),
        w('Auf Wiedersehen', 'Goodbye', 'Au revoir', '🤝', false, ['Tschüss']),
        w('Danke', 'Thank you', 'Merci', '🙏', false),
        w('Bitte', 'Please', "S'il te plaît", '🥺', false),
        w('Ja', 'Yes', 'Oui', '✅', false),
        w('Nein', 'No', 'Non', '❌', false),
        w('Entschuldigung', 'Excuse me', 'Excusez-moi', '🙇', false),
      ],
      sentences: [
        s('Ich heisse Anna.', 'My name is Anna.', "Je m'appelle Anna."),
        s('Wie heisst du?', 'What is your name?', "Comment tu t'appelles ?"),
        s('Wie geht es dir?', 'How are you?', 'Comment vas-tu ?'),
        s('Mir geht es gut, danke.', "I'm fine, thank you.", 'Je vais bien, merci.'),
        s('Ich komme aus Frankreich.', 'I come from France.', 'Je viens de France.'),
        s('Woher kommst du?', 'Where do you come from?', "D'où viens-tu ?"),
        s('Freut mich!', 'Nice to meet you!', 'Enchanté !'),
      ],
      tip: {
        en: 'German has two words for “you”: **du** for friends, family and children, and **Sie** for strangers and at work (always with a capital S).\n\n• Wie heisst **du**? – Wie heissen **Sie**?\n• Woher kommst **du**? – Woher kommen **Sie**?\n\nIn Switzerland people write **ss** instead of **ß**: heissen = heißen. Both are correct.',
        fr: 'L’allemand a deux mots pour « tu/vous » : **du** pour les amis, la famille et les enfants, et **Sie** pour les inconnus et au travail (toujours avec un S majuscule).\n\n• Wie heisst **du** ? – Wie heissen **Sie** ?\n• Woher kommst **du** ? – Woher kommen **Sie** ?\n\nEn Suisse, on écrit **ss** au lieu de **ß** : heissen = heißen. Les deux sont corrects.',
      },
    },
    {
      id: 'u02',
      emoji: '🔢',
      color: '#0EA5E9',
      title: { de: 'Zahlen', en: 'Numbers', fr: 'Les nombres' },
      words: [
        w('null', 'zero', 'zéro', '0️⃣'),
        w('eins', 'one', 'un', '1️⃣'),
        w('zwei', 'two', 'deux', '2️⃣'),
        w('drei', 'three', 'trois', '3️⃣'),
        w('vier', 'four', 'quatre', '4️⃣'),
        w('fünf', 'five', 'cinq', '5️⃣'),
        w('sechs', 'six', 'six', '6️⃣'),
        w('sieben', 'seven', 'sept', '7️⃣'),
        w('acht', 'eight', 'huit', '8️⃣'),
        w('neun', 'nine', 'neuf', '9️⃣'),
        w('zehn', 'ten', 'dix', '🔟'),
        w('zwanzig', 'twenty', 'vingt', '20'),
      ],
      sentences: [
        s('Wie alt bist du?', 'How old are you?', 'Quel âge as-tu ?'),
        s('Ich bin zwanzig Jahre alt.', 'I am twenty years old.', "J'ai vingt ans."),
        s('Sie ist acht Jahre alt.', 'She is eight years old.', 'Elle a huit ans.'),
        s('Wie alt ist er?', 'How old is he?', 'Quel âge a-t-il ?'),
        s('Ich zähle bis zehn.', 'I count to ten.', "Je compte jusqu'à dix."),
        s('Wir sind drei.', 'There are three of us.', 'Nous sommes trois.'),
      ],
      tip: {
        en: 'The verb **sein** (to be):\n\n• ich **bin** – I am\n• du **bist** – you are\n• er / sie / es **ist** – he / she / it is\n• wir **sind** – we are\n• ihr **seid** – you are (plural)\n• sie / Sie **sind** – they are / you are (polite)\n\nAge: **Ich bin 20 Jahre alt.**\n\nNumbers 13–19 are easy: drei + zehn = **dreizehn** (13), vier + zehn = **vierzehn** (14).',
        fr: 'Le verbe **sein** (être) :\n\n• ich **bin** – je suis\n• du **bist** – tu es\n• er / sie / es **ist** – il / elle est\n• wir **sind** – nous sommes\n• ihr **seid** – vous êtes (pluriel)\n• sie / Sie **sind** – ils sont / vous êtes (poli)\n\nAttention : en allemand, on **est** son âge, on ne l’**a** pas : **Ich bin 20 Jahre alt** = J’ai 20 ans.\n\nLes nombres 13–19 sont faciles : drei + zehn = **dreizehn** (13), vier + zehn = **vierzehn** (14).',
      },
    },
    {
      id: 'u03',
      emoji: '👨‍👩‍👧',
      color: '#EC4899',
      title: { de: 'Familie', en: 'Family', fr: 'La famille' },
      words: [
        w('die Familie', 'the family', 'la famille', '👨‍👩‍👧‍👦'),
        w('die Mutter', 'the mother', 'la mère', '👩', false),
        w('der Vater', 'the father', 'le père', '👨', false),
        w('das Kind', 'the child', "l'enfant", '🧒', false),
        w('das Baby', 'the baby', 'le bébé', '👶'),
        w('der Bruder', 'the brother', 'le frère', '👦', false),
        w('die Schwester', 'the sister', 'la sœur', '👧', false),
        w('die Oma', 'the grandma', 'la grand-mère', '👵'),
        w('der Opa', 'the grandpa', 'le grand-père', '👴'),
        w('der Freund', 'the friend', "l'ami", '🧑‍🤝‍🧑', false),
        w('der Hund', 'the dog', 'le chien', '🐕'),
        w('die Katze', 'the cat', 'le chat', '🐈'),
      ],
      sentences: [
        s('Das ist meine Mutter.', 'This is my mother.', "C'est ma mère."),
        s('Das ist mein Vater.', 'This is my father.', "C'est mon père."),
        s('Ich habe einen Bruder.', 'I have a brother.', "J'ai un frère."),
        s('Meine Schwester heisst Lea.', "My sister's name is Lea.", "Ma sœur s'appelle Lea."),
        s('Wir haben einen Hund.', 'We have a dog.', 'Nous avons un chien.'),
        s('Hast du Kinder?', 'Do you have children?', 'As-tu des enfants ?'),
      ],
      tip: {
        en: 'Every German noun has a gender: **der** (masculine), **die** (feminine) or **das** (neuter). Always learn the word together with der, die or das!\n\n“My”: **mein** Vater, **mein** Kind – but **meine** Mutter (feminine).\n\nThe verb **haben** (to have): ich **habe**, du **hast**, er/sie **hat**, wir **haben**.',
        fr: 'Chaque nom allemand a un genre : **der** (masculin), **die** (féminin) ou **das** (neutre). Apprends toujours le mot avec der, die ou das !\n\n« Mon / ma » : **mein** Vater, **mein** Kind – mais **meine** Mutter (féminin).\n\nLe verbe **haben** (avoir) : ich **habe**, du **hast**, er/sie **hat**, wir **haben**.',
      },
    },
    {
      id: 'u04',
      emoji: '🍎',
      color: '#22C55E',
      title: { de: 'Essen und Trinken', en: 'Food and drinks', fr: 'Manger et boire' },
      words: [
        w('der Apfel', 'the apple', 'la pomme', '🍎'),
        w('die Banane', 'the banana', 'la banane', '🍌'),
        w('das Brot', 'the bread', 'le pain', '🍞'),
        w('der Käse', 'the cheese', 'le fromage', '🧀'),
        w('das Ei', 'the egg', "l'œuf", '🥚'),
        w('der Fisch', 'the fish', 'le poisson', '🐟'),
        w('die Pizza', 'the pizza', 'la pizza', '🍕'),
        w('das Wasser', 'the water', "l'eau", '💧'),
        w('die Milch', 'the milk', 'le lait', '🥛'),
        w('der Kaffee', 'the coffee', 'le café', '☕'),
        w('der Tee', 'the tea', 'le thé', '🍵'),
        w('der Saft', 'the juice', 'le jus', '🧃'),
      ],
      sentences: [
        s('Ich esse einen Apfel.', 'I am eating an apple.', 'Je mange une pomme.'),
        s('Ich trinke Wasser.', 'I drink water.', "Je bois de l'eau."),
        s('Ich möchte einen Kaffee, bitte.', 'I would like a coffee, please.', "Je voudrais un café, s'il vous plaît."),
        s('Hast du Hunger?', 'Are you hungry?', 'As-tu faim ?'),
        s('Das schmeckt gut!', 'That tastes good!', "C'est bon !"),
        s('Die Rechnung, bitte.', 'The bill, please.', "L'addition, s'il vous plaît."),
      ],
      tip: {
        en: 'After verbs like **essen** (eat), **trinken** (drink) or **möchten** (would like), “a/an” changes for masculine words:\n\n• **der** Apfel → Ich esse **einen** Apfel.\n• **die** Banane → Ich esse **eine** Banane.\n• **das** Ei → Ich esse **ein** Ei.\n\nOnly der-words change. **Ich möchte …** is the polite way to order.',
        fr: 'Après des verbes comme **essen** (manger), **trinken** (boire) ou **möchten** (voudrais), « un / une » change pour les mots masculins :\n\n• **der** Apfel → Ich esse **einen** Apfel.\n• **die** Banane → Ich esse **eine** Banane.\n• **das** Ei → Ich esse **ein** Ei.\n\nSeuls les mots en der changent. **Ich möchte …** est la façon polie de commander.',
      },
    },
    {
      id: 'u05',
      emoji: '👕',
      color: '#F97316',
      title: { de: 'Farben und Kleidung', en: 'Colours and clothes', fr: 'Couleurs et vêtements' },
      words: [
        w('rot', 'red', 'rouge', '🟥'),
        w('blau', 'blue', 'bleu', '🟦'),
        w('grün', 'green', 'vert', '🟩'),
        w('gelb', 'yellow', 'jaune', '🟨'),
        w('schwarz', 'black', 'noir', '⬛'),
        w('weiss', 'white', 'blanc', '⬜'),
        w('das T-Shirt', 'the T-shirt', 'le T-shirt', '👕'),
        w('die Hose', 'the trousers', 'le pantalon', '👖'),
        w('der Schuh', 'the shoe', 'la chaussure', '👟'),
        w('die Jacke', 'the jacket', 'la veste', '🧥'),
        w('das Kleid', 'the dress', 'la robe', '👗'),
        w('die Socke', 'the sock', 'la chaussette', '🧦'),
      ],
      sentences: [
        s('Das T-Shirt ist rot.', 'The T-shirt is red.', 'Le T-shirt est rouge.'),
        s('Meine Hose ist blau.', 'My trousers are blue.', 'Mon pantalon est bleu.'),
        s('Ich trage eine Jacke.', 'I am wearing a jacket.', 'Je porte une veste.'),
        s('Welche Farbe hat das Kleid?', 'What colour is the dress?', 'De quelle couleur est la robe ?'),
        s('Die Schuhe sind schwarz.', 'The shoes are black.', 'Les chaussures sont noires.'),
        s('Ich mag Grün.', 'I like green.', "J'aime le vert."),
      ],
      tip: {
        en: 'Plural: the article is always **die**.\n\n• der Schuh → die Schuh**e**\n• die Jacke → die Jacke**n**\n• das Kleid → die Kleid**er**\n\nColours after **ist / sind** never change: Der Schuh ist **schwarz**. Die Schuhe sind **schwarz**.',
        fr: 'Pluriel : l’article est toujours **die**.\n\n• der Schuh → die Schuh**e**\n• die Jacke → die Jacke**n**\n• das Kleid → die Kleid**er**\n\nAprès **ist / sind**, la couleur ne change jamais : Der Schuh ist **schwarz**. Die Schuhe sind **schwarz**.',
      },
    },
    {
      id: 'u06',
      emoji: '🏠',
      color: '#A855F7',
      title: { de: 'Zuhause', en: 'At home', fr: 'À la maison' },
      words: [
        w('das Haus', 'the house', 'la maison', '🏠'),
        w('die Wohnung', 'the flat', "l'appartement", '🏢'),
        w('die Küche', 'the kitchen', 'la cuisine', '🍳', false),
        w('das Bad', 'the bathroom', 'la salle de bain', '🛁'),
        w('das Bett', 'the bed', 'le lit', '🛏️'),
        w('der Tisch', 'the table', 'la table', '🍽️', false),
        w('der Stuhl', 'the chair', 'la chaise', '🪑'),
        w('das Sofa', 'the sofa', 'le canapé', '🛋️'),
        w('die Tür', 'the door', 'la porte', '🚪'),
        w('das Fenster', 'the window', 'la fenêtre', '🪟'),
        w('die Lampe', 'the lamp', 'la lampe', '💡'),
        w('der Schlüssel', 'the key', 'la clé', '🔑'),
      ],
      sentences: [
        s('Ich wohne in Zürich.', 'I live in Zurich.', "J'habite à Zurich."),
        s('Meine Wohnung ist klein.', 'My flat is small.', 'Mon appartement est petit.'),
        s('Die Küche ist gross.', 'The kitchen is big.', 'La cuisine est grande.'),
        s('Wo ist der Schlüssel?', 'Where is the key?', 'Où est la clé ?'),
        s('Die Lampe ist auf dem Tisch.', 'The lamp is on the table.', 'La lampe est sur la table.'),
        s('Ich suche eine Wohnung.', 'I am looking for a flat.', 'Je cherche un appartement.'),
      ],
      tip: {
        en: 'Questions with **Wo?** (where):\n\n• **Wo** ist der Schlüssel? – Where is the key?\n• **Wo** wohnst du? – Where do you live?\n• Ich wohne **in** Zürich / **in** Lyon / **in** London.\n\nUseful pair: **gross** (big) ↔ **klein** (small).',
        fr: 'Les questions avec **Wo ?** (où) :\n\n• **Wo** ist der Schlüssel ? – Où est la clé ?\n• **Wo** wohnst du ? – Où habites-tu ?\n• Ich wohne **in** Zürich / **in** Lyon / **in** Genf.\n\nPaire utile : **gross** (grand) ↔ **klein** (petit).',
      },
    },
    {
      id: 'u07',
      emoji: '🚆',
      color: '#EF4444',
      title: { de: 'Stadt und Verkehr', en: 'Town and transport', fr: 'Ville et transports' },
      words: [
        w('der Bahnhof', 'the train station', 'la gare', '🚉'),
        w('der Zug', 'the train', 'le train', '🚆'),
        w('der Bus', 'the bus', 'le bus', '🚌'),
        w('das Auto', 'the car', 'la voiture', '🚗'),
        w('das Fahrrad', 'the bicycle', 'le vélo', '🚲'),
        w('das Flugzeug', 'the plane', "l'avion", '✈️'),
        w('die Strasse', 'the street', 'la rue', '🛣️', false),
        w('der Supermarkt', 'the supermarket', 'le supermarché', '🛒'),
        w('die Apotheke', 'the pharmacy', 'la pharmacie', '⚕️', false),
        w('das Krankenhaus', 'the hospital', "l'hôpital", '🏥'),
        w('die Schule', 'the school', "l'école", '🏫'),
        w('die Bank', 'the bank', 'la banque', '🏦'),
      ],
      sentences: [
        s('Wo ist der Bahnhof?', 'Where is the train station?', 'Où est la gare ?'),
        s('Gehen Sie geradeaus.', 'Go straight ahead.', 'Allez tout droit.'),
        s('Dann links.', 'Then left.', 'Puis à gauche.'),
        s('Die Apotheke ist rechts.', 'The pharmacy is on the right.', 'La pharmacie est à droite.'),
        s('Ich fahre mit dem Zug.', 'I am going by train.', 'Je prends le train.'),
        s('Ich fahre mit dem Fahrrad.', 'I am going by bike.', 'Je vais à vélo.'),
      ],
      tip: {
        en: 'Directions: **links** (left), **rechts** (right), **geradeaus** (straight ahead).\n\nTransport with **mit dem**: mit dem Zug, mit dem Bus, mit dem Auto, mit dem Fahrrad.\n\nSwiss tip: in Switzerland a bicycle is often called **das Velo**, and a hospital **das Spital**.',
        fr: 'Les directions : **links** (à gauche), **rechts** (à droite), **geradeaus** (tout droit).\n\nLes transports avec **mit dem** : mit dem Zug, mit dem Bus, mit dem Auto, mit dem Fahrrad.\n\nAstuce suisse : en Suisse, on dit souvent **das Velo** pour le vélo et **das Spital** pour l’hôpital.',
      },
    },
    {
      id: 'u08',
      emoji: '⏰',
      color: '#14B8A6',
      title: { de: 'Zeit und Tage', en: 'Time and days', fr: 'Le temps et les jours' },
      words: [
        w('Montag', 'Monday', 'lundi', '📅', false),
        w('Dienstag', 'Tuesday', 'mardi', '📅', false),
        w('Mittwoch', 'Wednesday', 'mercredi', '📅', false),
        w('Donnerstag', 'Thursday', 'jeudi', '📅', false),
        w('Freitag', 'Friday', 'vendredi', '📅', false),
        w('Samstag', 'Saturday', 'samedi', '📅', false),
        w('Sonntag', 'Sunday', 'dimanche', '📅', false),
        w('heute', 'today', "aujourd'hui", '👇', false),
        w('morgen', 'tomorrow', 'demain', '👉', false),
        w('die Uhr', 'the clock', "l'horloge", '⏰'),
        w('die Woche', 'the week', 'la semaine', '🗓️', false),
        w('das Wochenende', 'the weekend', 'le week-end', '🎉', false),
      ],
      sentences: [
        s('Wie spät ist es?', 'What time is it?', 'Quelle heure est-il ?'),
        s('Es ist acht Uhr.', "It is eight o'clock.", 'Il est huit heures.'),
        s('Heute ist Montag.', 'Today is Monday.', "Aujourd'hui, c'est lundi."),
        s('Am Samstag habe ich frei.', 'On Saturday I am off.', 'Samedi, je suis libre.'),
        s('Der Kurs beginnt um neun Uhr.', "The course starts at nine o'clock.", 'Le cours commence à neuf heures.'),
        s('Bis morgen!', 'See you tomorrow!', 'À demain !'),
      ],
      tip: {
        en: '• Days: **am** Montag (on Monday)\n• Time: **um** acht Uhr (at eight o’clock)\n\nImportant rule: the verb is always in **position 2**.\n\n• Ich **habe** am Samstag frei.\n• Am Samstag **habe** ich frei.',
        fr: '• Les jours : **am** Montag (lundi / le lundi)\n• L’heure : **um** acht Uhr (à huit heures)\n\nRègle importante : le verbe est toujours en **position 2**.\n\n• Ich **habe** am Samstag frei.\n• Am Samstag **habe** ich frei.',
      },
    },
    {
      id: 'u09',
      emoji: '🛍️',
      color: '#EAB308',
      title: { de: 'Einkaufen', en: 'Shopping', fr: 'Faire les courses' },
      words: [
        w('das Geld', 'the money', "l'argent", '💶'),
        w('die Karte', 'the card', 'la carte', '💳'),
        w('die Tasche', 'the bag', 'le sac', '👜'),
        w('der Preis', 'the price', 'le prix', '🏷️'),
        w('das Geschäft', 'the shop', 'le magasin', '🏪'),
        w('die Kasse', 'the till', 'la caisse', '🧾', false),
        w('teuer', 'expensive', 'cher', '💰', false),
        w('billig', 'cheap', 'bon marché', '🪙', false),
        w('kaufen', 'to buy', 'acheter', '🛍️', false),
        w('bezahlen', 'to pay', 'payer', '💸', false),
        w('offen', 'open', 'ouvert', '🔓', false),
        w('geschlossen', 'closed', 'fermé', '🔒', false),
      ],
      sentences: [
        s('Was kostet das?', 'How much is this?', 'Combien ça coûte ?'),
        s('Das kostet fünf Euro.', 'That costs five euros.', 'Ça coûte cinq euros.'),
        s('Das ist zu teuer.', 'That is too expensive.', "C'est trop cher."),
        s('Kann ich mit Karte bezahlen?', 'Can I pay by card?', 'Est-ce que je peux payer par carte ?'),
        s('Ich nehme das.', "I'll take it.", 'Je le prends.'),
        s('Brauchen Sie eine Tasche?', 'Do you need a bag?', "Avez-vous besoin d'un sac ?"),
      ],
      tip: {
        en: 'The verb **können** (can) sends the second verb to the **end** of the sentence:\n\n• Ich **kann** mit Karte **bezahlen**.\n• **Kann** ich mit Karte **bezahlen**?\n\nich kann, du kannst, er/sie kann, wir können.\n\nSwiss tip: in Switzerland you pay in **Franken** (CHF), not in Euro.',
        fr: 'Le verbe **können** (pouvoir) envoie le deuxième verbe à la **fin** de la phrase :\n\n• Ich **kann** mit Karte **bezahlen**.\n• **Kann** ich mit Karte **bezahlen** ?\n\nich kann, du kannst, er/sie kann, wir können.\n\nAstuce suisse : en Suisse, on paie en **Franken** (CHF), pas en euros.',
      },
    },
    {
      id: 'u10',
      emoji: '💼',
      color: '#3B82F6',
      title: { de: 'Arbeit und Berufe', en: 'Work and jobs', fr: 'Travail et métiers' },
      words: [
        w('die Arbeit', 'the work', 'le travail', '💼'),
        w('der Beruf', 'the job', 'le métier', '🪪', false),
        w('der Lehrer', 'the teacher', "l'enseignant", '🧑‍🏫'),
        w('die Ärztin', 'the doctor (woman)', 'la médecin', '👩‍⚕️', true, ['der Arzt']),
        w('der Koch', 'the cook', 'le cuisinier', '👨‍🍳'),
        w('die Polizistin', 'the police officer (woman)', 'la policière', '👮‍♀️'),
        w('der Bauer', 'the farmer', "l'agriculteur", '🧑‍🌾'),
        w('der Mechaniker', 'the mechanic', 'le mécanicien', '🧑‍🔧'),
        w('der Computer', 'the computer', "l'ordinateur", '💻'),
        w('das Büro', 'the office', 'le bureau', '🏢', false),
        w('arbeiten', 'to work', 'travailler', '⚒️', false),
        w('der Kollege', 'the colleague', 'le collègue', '🤝', false),
      ],
      sentences: [
        s('Was bist du von Beruf?', 'What do you do for a living?', 'Quel est ton métier ?'),
        s('Ich bin Lehrer.', 'I am a teacher.', 'Je suis enseignant.'),
        s('Meine Schwester ist Ärztin.', 'My sister is a doctor.', 'Ma sœur est médecin.'),
        s('Ich arbeite in einem Büro.', 'I work in an office.', 'Je travaille dans un bureau.'),
        s('Ich arbeite von Montag bis Freitag.', 'I work from Monday to Friday.', 'Je travaille du lundi au vendredi.'),
        s('Ich suche Arbeit.', 'I am looking for work.', 'Je cherche du travail.'),
      ],
      tip: {
        en: 'Jobs have no “a”: **Ich bin Lehrer.** (I am a teacher.)\n\nWomen: add **-in** → der Lehrer → die Lehrer**in**, der Koch → die Köch**in**.\n\nVerb endings (arbeiten): ich arbeit**e**, du arbeit**est**, er/sie arbeit**et**, wir arbeit**en**.',
        fr: 'Pour les métiers, pas d’article : **Ich bin Lehrer.** (Je suis enseignant.)\n\nAu féminin, on ajoute **-in** : der Lehrer → die Lehrer**in**, der Koch → die Köch**in**.\n\nTerminaisons du verbe (arbeiten) : ich arbeit**e**, du arbeit**est**, er/sie arbeit**et**, wir arbeit**en**.',
      },
    },
    {
      id: 'u11',
      emoji: '🩺',
      color: '#F43F5E',
      title: { de: 'Körper und Gesundheit', en: 'Body and health', fr: 'Le corps et la santé' },
      words: [
        w('der Kopf', 'the head', 'la tête', '🗣️', false),
        w('das Auge', 'the eye', "l'œil", '👁️'),
        w('das Ohr', 'the ear', "l'oreille", '👂'),
        w('die Nase', 'the nose', 'le nez', '👃'),
        w('der Mund', 'the mouth', 'la bouche', '👄'),
        w('die Hand', 'the hand', 'la main', '✋'),
        w('der Arm', 'the arm', 'le bras', '💪'),
        w('das Bein', 'the leg', 'la jambe', '🦵'),
        w('der Fuss', 'the foot', 'le pied', '🦶'),
        w('der Zahn', 'the tooth', 'la dent', '🦷'),
        w('krank', 'ill', 'malade', '🤒', false),
        w('das Medikament', 'the medicine', 'le médicament', '💊'),
      ],
      sentences: [
        s('Ich bin krank.', 'I am ill.', 'Je suis malade.'),
        s('Ich habe Kopfschmerzen.', 'I have a headache.', "J'ai mal à la tête."),
        s('Mein Fuss tut weh.', 'My foot hurts.', "J'ai mal au pied."),
        s('Ich brauche einen Arzt.', 'I need a doctor.', "J'ai besoin d'un médecin."),
        s('Ich habe einen Termin.', 'I have an appointment.', "J'ai un rendez-vous."),
        s('Gute Besserung!', 'Get well soon!', 'Bon rétablissement !'),
      ],
      tip: {
        en: 'Something hurts:\n\n• Mein Kopf **tut weh**. (one thing)\n• Meine Füsse **tun weh**. (more things)\n• Ich habe **Kopfschmerzen** / **Bauchschmerzen** / **Zahnschmerzen**.\n\nEmergency number in Switzerland: **144**. In all of Europe: **112**.',
        fr: 'Quand on a mal :\n\n• Mein Kopf **tut weh**. (une chose)\n• Meine Füsse **tun weh**. (plusieurs choses)\n• Ich habe **Kopfschmerzen** / **Bauchschmerzen** / **Zahnschmerzen**.\n\nNuméro d’urgence en Suisse : **144**. Dans toute l’Europe : **112**.',
      },
    },
    {
      id: 'u12',
      emoji: '⚽',
      color: '#10B981',
      title: { de: 'Freizeit und Wetter', en: 'Free time and weather', fr: 'Loisirs et météo' },
      words: [
        w('die Sonne', 'the sun', 'le soleil', '☀️'),
        w('der Regen', 'the rain', 'la pluie', '🌧️'),
        w('der Schnee', 'the snow', 'la neige', '❄️'),
        w('das Wetter', 'the weather', 'la météo', '🌦️', false),
        w('kalt', 'cold', 'froid', '🥶'),
        w('warm', 'warm', 'chaud', '🥵'),
        w('der Fussball', 'the football', 'le foot', '⚽'),
        w('die Musik', 'the music', 'la musique', '🎵'),
        w('schwimmen', 'to swim', 'nager', '🏊'),
        w('lesen', 'to read', 'lire', '📖'),
        w('kochen', 'to cook', 'cuisiner', '🍲', false),
        w('tanzen', 'to dance', 'danser', '💃'),
      ],
      sentences: [
        s('Wie ist das Wetter?', "What's the weather like?", 'Quel temps fait-il ?'),
        s('Es regnet.', 'It is raining.', 'Il pleut.'),
        s('Die Sonne scheint.', 'The sun is shining.', 'Le soleil brille.'),
        s('Heute ist es kalt.', 'It is cold today.', "Il fait froid aujourd'hui."),
        s('Ich spiele gern Fussball.', 'I like playing football.', "J'aime jouer au foot."),
        s('Was machst du am Wochenende?', 'What are you doing at the weekend?', 'Que fais-tu le week-end ?'),
        s('Ich höre gern Musik.', 'I like listening to music.', "J'aime écouter de la musique."),
      ],
      tip: {
        en: 'Say what you like doing with **gern** after the verb:\n\n• Ich lese **gern**. – I like reading.\n• Ich tanze **gern**. – I like dancing.\n• Ich koche **nicht gern**. – I don’t like cooking.\n\nWeather: **Es regnet.** (It’s raining.) **Es schneit.** (It’s snowing.)',
        fr: 'Pour dire ce qu’on aime faire, on met **gern** après le verbe :\n\n• Ich lese **gern**. – J’aime lire.\n• Ich tanze **gern**. – J’aime danser.\n• Ich koche **nicht gern**. – Je n’aime pas cuisiner.\n\nLa météo : **Es regnet.** (Il pleut.) **Es schneit.** (Il neige.)',
      },
    },
  ],
};

// Türkisch dazunehmen (Übersetzungen in tr.js, gleiche Reihenfolge)
for (const u of COURSE.units) {
  const t = TR[u.id];
  if (!t || t.words.length !== u.words.length || t.sentences.length !== u.sentences.length) {
    throw new Error(`Türkische Übersetzung passt nicht zu ${u.id}`);
  }
  u.title.tr = t.title;
  u.tip.tr = t.tip;
  u.words.forEach((x, i) => (x.tr = t.words[i]));
  u.sentences.forEach((x, i) => (x.tr = t.sentences[i]));
}

// Ohne Code ist in JEDER Einheit die erste Lektion gratis (die ersten 6 Wörter).
// Dazu ein paar Sätze pro Einheit, damit das Satz-Rennen als Gratis-Spiel geht.
export const TRIAL_WORDS = 6;
export const TRIAL_SENTENCES = 3;

// Version für Nicht-Zahlende: alle Titel und Tipps, pro Einheit nur die Inhalte der Gratis-Lektion.
export function trialCourse() {
  return {
    ...COURSE,
    units: COURSE.units.map((u, i) => ({
      id: u.id,
      emoji: u.emoji,
      color: u.color,
      title: u.title,
      tip: u.tip,
      words: u.words.slice(0, TRIAL_WORDS),
      sentences: u.sentences.slice(0, TRIAL_SENTENCES),
      locked: true,
    })),
  };
}
